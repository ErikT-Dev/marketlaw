import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import type { GamePhase } from "../../shared/GamePhase";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { startSavedGame } from "../../rules/startSavedGame";
import { VOTE_RULES } from "../../rules/VOTE_RULES";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { alarmChangeFor } from "./alarmChangeFor";
import { fireAlarm } from "./fireAlarm";
import { NO_CHAT } from "./NO_CHAT";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";
import { NO_WAITING } from "./NO_WAITING";
import { receiveMessage } from "./receiveMessage";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const STARTED_AT = 1_000_000;
const VOTE_DEADLINE = STARTED_AT + VOTE_RULES.answerMs;

function playingRoom(phase: GamePhase = "main"): RoomRecord {
  const started = startSavedGame(
    { players: 3, kind: "casual", startedAt: v.parse(EpochMs, STARTED_AT) },
    3,
  );
  const saved = { ...started, state: { ...started.state, phase } };
  const players = [1, 2, 3].map((seat) => ({
    playerId: v.parse(PlayerId, crypto.randomUUID()),
    name: `Seat ${String(seat)}`,
    icon: TEST_PLAYER_ICON,
  }));
  return {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: v.parse(RoomCode, "K7QR2P"),
    size: 3,
    isPublic: false,
    players,
    waiting: NO_WAITING,
    chat: NO_CHAT,
    game: {
      kind: "casual",
      ratingsBeforeGame: [],
      saved,
      seats: saved.state.seats.map((seat, index) => ({
        seat: seat.seat,
        playerId: players[index]?.playerId ?? v.parse(PlayerId, crypto.randomUUID()),
        name: players[index]?.name ?? "",
        icon: players[index]?.icon ?? TEST_PLAYER_ICON,
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}

function storageWith(record: RoomRecord): RoomStorage & { readonly saved: () => RoomRecord } {
  let stored = record;
  return {
    read: () => stored,
    write: (next) => {
      stored = next;
    },
    remove: () => {
      throw new Error("the test never removes the room");
    },
    saved: () => stored,
  };
}

type Sent = {
  readonly seatIndex: number;
  readonly action: Readonly<Record<string, unknown>>;
  readonly actionId?: string;
  readonly stateVersion?: number;
};

function send(storage: RoomStorage, sent: Sent) {
  const record = storage.read();
  const player = record?.players[sent.seatIndex];
  const seat = record?.game?.seats[sent.seatIndex];
  if (player === undefined || seat === undefined) {
    throw new Error("no such seat");
  }
  const text = JSON.stringify({
    protocolVersion: PROTOCOL_VERSION,
    token: "t",
    type: "action",
    actionId: sent.actionId ?? crypto.randomUUID(),
    stateVersion: sent.stateVersion ?? seat.stateVersion,
    action: sent.action,
  });
  const now = v.parse(EpochMs, STARTED_AT);
  const outcome = receiveMessage(storage, {
    connection: { identity: player, rejectionTimes: [] },
    parsed: parseClientMessage(text),
    sender: player,
    now,
    randomFor: randomForNextAction,
    livePlayers: [],
    chat: NO_CHAT_CONTEXT,
    gameStart: { seed: 1, now, seatOrder: (ids) => ids, limitRejectionFor: () => null },
  });
  if (outcome.isRoomGone) {
    throw new Error("the room is gone");
  }
  return outcome;
}

function versionsOf(record: RoomRecord): ReadonlyArray<number> {
  return record.game?.seats.map(({ stateVersion }) => stateVersion) ?? [];
}

const CALL = { type: "call_vote" };
const YES = { type: "vote", vote: "yes" };

describe("an abandon vote in the room", () => {
  it("raises only the caller's state version and updates the other players", () => {
    const storage = storageWith(playingRoom());
    const outcome = send(storage, { seatIndex: 0, action: CALL });
    expect(outcome.reply).toMatchObject({ type: "update" });
    expect(storage.saved().game?.saved.state.vote?.caller).toBe(1);
    expect(versionsOf(storage.saved())).toEqual([1, 0, 0]);
    const others = storage
      .saved()
      .players.slice(1)
      .map(({ playerId }) => playerId);
    expect(outcome.playersToUpdate).toEqual(expect.arrayContaining(others));
  });

  it("raises only the actor's state version in the market phase too", () => {
    const storage = storageWith(playingRoom("market"));
    send(storage, { seatIndex: 0, action: CALL });
    send(storage, { seatIndex: 1, action: { type: "vote", vote: "no" } });
    expect(versionsOf(storage.saved())).toEqual([1, 1, 0]);
  });

  it("raises the others' state versions too when the vote passes and ends the game", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 0, action: CALL });
    send(storage, { seatIndex: 1, action: YES });
    send(storage, { seatIndex: 2, action: YES });
    expect(storage.saved().game?.saved.state.result?.endedBy).toBe("abandoned_by_vote");
    expect(versionsOf(storage.saved())).toEqual([2, 2, 1]);
  });

  it("sets the room alarm to the vote deadline and closes the vote when it fires", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 0, action: CALL });
    const voting = storage.saved();
    expect(alarmChangeFor(null, voting)).toEqual({ kind: "set", at: VOTE_DEADLINE });
    const fired = fireAlarm(voting, v.parse(EpochMs, VOTE_DEADLINE), randomForNextAction);
    expect(fired.game?.saved.state.vote).toBeNull();
    expect(fired.game?.saved.actionLog.at(-1)?.action).toEqual({ type: "close_vote", seat: 1 });
    expect(versionsOf(fired)).toEqual([1, 0, 0]);
  });
});

describe("a hostile client and the abandon vote", () => {
  it("gets the original result for a repeated vote action id and changes nothing more", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 0, action: CALL, actionId: "call-1" });
    const before = storage.saved();
    const repeated = send(storage, {
      seatIndex: 0,
      action: CALL,
      actionId: "call-1",
      stateVersion: 0,
    });
    expect(repeated.reply).toMatchObject({ type: "update", acceptedActionId: "call-1" });
    expect(storage.saved()).toBe(before);
  });

  it("is rejected as stale_state for an answer based on an older state version", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 0, action: CALL });
    const before = storage.saved();
    const outcome = send(storage, { seatIndex: 1, action: YES, stateVersion: 7 });
    expect(outcome.reply).toMatchObject({ type: "rejected", code: "stale_state" });
    expect(storage.saved()).toBe(before);
  });

  it("is rejected as not_in_game for a vote from a seat that left the game", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 2, action: { type: "leave_game" } });
    const before = storage.saved();
    const outcome = send(storage, { seatIndex: 2, action: CALL });
    expect(outcome.reply).toMatchObject({ type: "rejected", code: "not_in_game" });
    expect(storage.saved()).toBe(before);
  });

  it("is rejected as malformed_message for an answer that is not yes or no", () => {
    const storage = storageWith(playingRoom());
    send(storage, { seatIndex: 0, action: CALL });
    const before = storage.saved();
    const outcome = send(storage, { seatIndex: 1, action: { type: "vote", vote: "maybe" } });
    expect(outcome.reply).toMatchObject({ type: "rejected", code: "malformed_message" });
    expect(storage.saved()).toBe(before);
  });
});
