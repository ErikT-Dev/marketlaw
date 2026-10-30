import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { startSavedGame } from "../../rules/startSavedGame";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { alarmChangeFor } from "./alarmChangeFor";
import { fireAlarm } from "./fireAlarm";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const STARTED_AT = 1_000_000;
const FIRST_DEADLINE = STARTED_AT + 180_000;

function playingRoom(): RoomRecord {
  const saved = startSavedGame({ players: 2, startedAt: v.parse(EpochMs, STARTED_AT) }, 3);
  const players = [1, 2].map((seat) => ({
    playerId: v.parse(PlayerId, crypto.randomUUID()),
    name: `Seat ${String(seat)}`,
  }));
  return {
    schemaVersion: 1,
    code: v.parse(RoomCode, "K7QR2P"),
    size: 2,
    players,
    game: {
      saved,
      seats: saved.state.seats.map((seat, index) => ({
        seat: seat.seat,
        playerId: players[index]?.playerId ?? v.parse(PlayerId, crypto.randomUUID()),
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}

describe("the room alarm", () => {
  it("is set to the earliest deadline and kept while it does not change", () => {
    const room = playingRoom();
    expect(alarmChangeFor(null, room)).toEqual({ kind: "set", at: FIRST_DEADLINE });
    expect(alarmChangeFor(FIRST_DEADLINE, room)).toEqual({ kind: "keep" });
    expect(alarmChangeFor(FIRST_DEADLINE, { ...room, game: null })).toEqual({ kind: "delete" });
  });

  it("applies due time-outs when it fires and tells every player, and does nothing early", () => {
    const room = playingRoom();
    const early = fireAlarm(room, v.parse(EpochMs, FIRST_DEADLINE - 1), randomForNextAction);
    expect(early).toBe(room);
    const fired = fireAlarm(room, v.parse(EpochMs, FIRST_DEADLINE), randomForNextAction);
    expect(fired.game?.saved.actionLog.map(({ action }) => action)).toEqual([
      { type: "time_out", seat: 1 },
      { type: "time_out", seat: 2 },
    ]);
    expect(fired.game?.saved.state.turn).toBe(2);
    expect(fired.game?.seats.map(({ stateVersion }) => stateVersion)).toEqual([1, 1]);
  });
});

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

function lateEndTurn(storage: RoomStorage, seatIndex: number, now: number) {
  const record = storage.read();
  const player = record?.players[seatIndex];
  const seat = record?.game?.seats[seatIndex];
  if (player === undefined || seat === undefined) {
    throw new Error("no such seat");
  }
  const text = JSON.stringify({
    protocolVersion: 1,
    token: "t",
    type: "action",
    actionId: `late-${String(now)}`,
    stateVersion: seat.stateVersion,
    action: { type: "end_turn" },
  });
  return receiveMessage(storage, {
    connection: { identity: player, rejectionTimes: [] },
    parsed: parseClientMessage(text),
    sender: player,
    now: v.parse(EpochMs, now),
    randomFor: randomForNextAction,
  });
}

describe("a message that arrives after its deadline before the alarm", () => {
  it("is rejected out of time, applies every time-out due then, saves and updates everyone", () => {
    const storage = storageWith(playingRoom());
    const outcome = lateEndTurn(storage, 0, FIRST_DEADLINE + 500);
    expect(outcome.isRoomGone ? null : outcome.reply).toMatchObject({
      type: "rejected",
      code: "out_of_time",
    });
    const game = storage.saved().game;
    expect(game?.saved.actionLog.map(({ action }) => action)).toEqual([
      { type: "time_out", seat: 1 },
      { type: "time_out", seat: 2 },
    ]);
    expect(game?.seats.map(({ stateVersion }) => stateVersion)).toEqual([1, 1]);
    expect(outcome.isRoomGone ? [] : outcome.playersToUpdate).toHaveLength(2);
  });

  it("is rejected out of time when the alarm already applied the time-out", () => {
    const record = playingRoom();
    const storage = storageWith(
      fireAlarm(record, v.parse(EpochMs, FIRST_DEADLINE), randomForNextAction),
    );
    const before = storage.saved();
    const outcome = lateEndTurn(storage, 0, FIRST_DEADLINE + 500);
    expect(outcome.isRoomGone ? null : outcome.reply).toMatchObject({ code: "out_of_time" });
    expect(storage.saved()).toBe(before);
  });
});
