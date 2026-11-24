import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { endGame } from "../../rules/endGame";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import type { GameStartRejection } from "../lobby/GameStartRejection";
import { endedGameOf } from "../replays/endedGameOf";
import { chatTrackingStorage } from "./chatTrackingStorage";
import { createRoomIn } from "./createRoomIn";
import { endedRoomDeletionAt } from "./endedRoomDeletionAt";
import { fireRoomAlarm } from "./fireRoomAlarm";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { nextAlarmAt } from "./nextAlarmAt";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";
import { receiveCheckingGameStart } from "./receiveCheckingGameStart";
import { ROOM_TIMES } from "./ROOM_TIMES";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";
import { updateFor } from "./updateFor";

const STARTED_AT = 5_000_000;
const ENDED_AT = 6_000_000;
const ASKED_AT = v.parse(EpochMs, 7_000_000);
const ANN: Identity = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Ann",
  icon: TEST_PLAYER_ICON,
};
const BEA: Identity = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Bea",
  icon: TEST_PLAYER_ICON,
};

type Kept = { record?: RoomRecord };

function storageOf(kept: Kept): RoomStorage {
  return chatTrackingStorage(
    {
      read: () => kept.record,
      write: (record) => {
        kept.record = record;
      },
      remove: () => {
        delete kept.record;
      },
    },
    () => ({ messageCount: 0, now: ASKED_AT }),
  );
}

async function send(
  storage: RoomStorage,
  sender: Identity,
  action: Readonly<Record<string, unknown>>,
  lobbyAnswer: GameStartRejection | null = null,
  now: EpochMs = ASKED_AT,
) {
  const outcome = await receiveCheckingGameStart(
    storage,
    {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(
        JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", type: "room", action }),
      ),
      sender,
      now,
      randomFor: randomForNextAction,
      gameStart: { seed: 3, now, seatOrder: (players) => players },
      livePlayers: [ANN.playerId, BEA.playerId],
      chat: NO_CHAT_CONTEXT,
    },
    async () => Promise.resolve(lobbyAnswer),
  );
  if (outcome.isRoomGone) {
    throw new Error("the room is gone");
  }
  return outcome;
}

async function endedRoomOfAnnAndBea(): Promise<{ storage: RoomStorage; kept: Kept }> {
  const kept: Kept = {};
  const storage = storageOf(kept);
  const startedAt = v.parse(EpochMs, STARTED_AT);
  createRoomIn(
    storage,
    { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true },
    ANN,
    startedAt,
  );
  joinRoomIn(storage, BEA, startedAt, [ANN.playerId, BEA.playerId]);
  await send(storage, ANN, { type: "accept_game" }, null, startedAt);
  await send(storage, BEA, { type: "accept_game" }, null, startedAt);
  const game = kept.record?.game;
  if (kept.record === undefined || game === undefined || game === null) {
    throw new Error("the game did not start");
  }
  const state = endGame(game.saved.state, ENDED_AT);
  kept.record = { ...kept.record, game: { ...game, saved: { ...game.saved, state } } };
  return { storage, kept };
}

function current(kept: Kept): RoomRecord {
  if (kept.record === undefined) {
    throw new Error("the room is gone");
  }
  return kept.record;
}

describe("a rematch in the room", () => {
  it("shows the deletion time of an ended room and wakes the room when the asking runs out", async () => {
    const { storage, kept } = await endedRoomOfAnnAndBea();
    const deletionAt = endedRoomDeletionAt(current(kept));
    expect(updateFor(current(kept), ANN.playerId).room.deletionAt).toBe(deletionAt);
    await send(storage, BEA, { type: "ask_rematch" });
    const deadline = ASKED_AT + ROOM_TIMES.acceptMs;
    expect(nextAlarmAt(current(kept))).toBe(deadline);
    const fired = fireRoomAlarm(current(kept), v.parse(EpochMs, deadline), randomForNextAction, []);
    expect(fired.removals).toEqual([]);
    expect(fired.record?.waiting.asking).toBeNull();
    expect(fired.record?.players).toEqual(current(kept).players);
    expect(fired.record === null ? null : nextAlarmAt(fired.record)).toBe(deletionAt);
  });

  it("refuses a second rematch while one is asked and a rematch while the game runs", async () => {
    const { storage, kept } = await endedRoomOfAnnAndBea();
    await send(storage, BEA, { type: "ask_rematch" });
    const again = await send(storage, ANN, { type: "ask_rematch" });
    expect(again.reply).toMatchObject({ type: "rejected", code: "rematch_not_possible" });
    await send(storage, ANN, { type: "accept_game" });
    await send(storage, BEA, { type: "accept_game" });
    const during = await send(storage, ANN, { type: "ask_rematch" });
    expect(during.reply).toMatchObject({ type: "rejected", code: "rematch_not_possible" });
    expect(current(kept).waiting.asking).toBeNull();
  });

  it("starts a new game that drops the deletion time, saves no replay record and adds a chat line", async () => {
    const { storage, kept } = await endedRoomOfAnnAndBea();
    const ended = current(kept);
    await send(storage, ANN, { type: "ask_rematch" });
    await send(storage, ANN, { type: "accept_game" });
    await send(storage, BEA, { type: "accept_game" });
    const rematch = current(kept);
    expect(rematch.game?.saved.state.phase).toBe("main");
    expect(rematch.game?.saved.state.turn).toBe(1);
    expect(rematch.game?.saved.state.seats).toHaveLength(2);
    expect(rematch.game?.saved.state.clockStartedAt).toBe(ASKED_AT);
    expect(endedRoomDeletionAt(rematch)).toBeNull();
    expect(updateFor(rematch, ANN.playerId).room.deletionAt).toBeNull();
    expect(endedGameOf(ended, rematch)).toBeNull();
    expect(rematch.chat.lines.map(({ entry }) => entry)).toContainEqual({
      kind: "game_line",
      event: "game_started",
      at: ASKED_AT,
    });
  });

  it("ends the asking at a player's daily limit and keeps everyone in the room", async () => {
    const { storage, kept } = await endedRoomOfAnnAndBea();
    await send(storage, ANN, { type: "ask_rematch" });
    await send(storage, ANN, { type: "accept_game" });
    const outcome = await send(
      storage,
      BEA,
      { type: "accept_game" },
      {
        kind: "players_over_limit",
        players: [
          { playerId: ANN.playerId, reason: "daily_game_start_limit" },
          { playerId: BEA.playerId, reason: "daily_action_limit" },
        ],
      },
    );
    expect(outcome.reply).toMatchObject({ type: "rejected", code: "daily_action_limit" });
    expect(outcome.removals).toEqual([]);
    expect(outcome.notices).toEqual([
      { playerId: ANN.playerId, notice: { kind: "daily_limit", reason: "daily_game_start_limit" } },
    ]);
    expect(current(kept).players).toEqual([ANN, BEA]);
    expect(current(kept).waiting.asking).toBeNull();
    expect(current(kept).game?.saved.state.phase).toBe("ended");
  });

  it("lists the players still in the room apart from the seats of the ended game", async () => {
    const { storage, kept } = await endedRoomOfAnnAndBea();
    expect(updateFor(current(kept), ANN.playerId).room.namesInRoom).toEqual(["Ann", "Bea"]);
    await send(storage, BEA, { type: "leave_room" });
    const { room } = updateFor(current(kept), ANN.playerId);
    expect(room.namesInRoom).toEqual(["Ann"]);
    expect(room.playerNames).toEqual(["Ann", "Bea"]);
  });

  it("tells each player the name they have in the room", async () => {
    const { kept } = await endedRoomOfAnnAndBea();
    expect(updateFor(current(kept), ANN.playerId).room.myName).toBe("Ann");
    expect(updateFor(current(kept), BEA.playerId).room.myName).toBe("Bea");
  });
});
