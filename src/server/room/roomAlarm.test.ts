import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { startSavedGame } from "../../rules/startSavedGame";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { alarmChangeFor } from "./alarmChangeFor";
import { fireAlarm } from "./fireAlarm";
import type { RoomRecord } from "./RoomRecord";

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
