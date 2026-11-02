import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { startSavedGame } from "../../rules/startSavedGame";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { decodeRoomRecord } from "./decodeRoomRecord";
import { encodeRoomRecord } from "./encodeRoomRecord";
import type { RoomRecord } from "./RoomRecord";

function startedRoom(): RoomRecord {
  const saved = startSavedGame({ players: 2, startedAt: v.parse(EpochMs, 1_000_000) }, 3);
  const players = ["Ann", "Bea"].map((name) => ({
    playerId: v.parse(PlayerId, crypto.randomUUID()),
    name,
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

describe("a stored room", () => {
  it("is saved compressed and loads back unchanged", async () => {
    const room = startedRoom();
    const stored = await encodeRoomRecord(room);
    expect(stored.length).toBeLessThan(JSON.stringify(room).length / 2);
    expect(await decodeRoomRecord(stored)).toEqual(room);
  });

  it("loads as no room when nothing or something else is stored", async () => {
    expect(await decodeRoomRecord(undefined)).toBeUndefined();
    expect(await decodeRoomRecord({ schemaVersion: 1 })).toBeUndefined();
  });
});
