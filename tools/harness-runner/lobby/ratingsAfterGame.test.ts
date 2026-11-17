import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { ratingsAfterGameOf } from "../../../src/server/records/ratingsAfterGameOf.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";

function endedRoom(kind: "casual" | "ranked"): RoomRecord {
  return lobbyRoomFromGiven(
    {
      code: "K7QR2P",
      size: 3,
      public: false,
      players: ["Ann", "Bea", "Cat"],
      state: "ended",
      ended_ms: 5000,
      kind,
    },
    (name) => ({ playerId: v.parse(PlayerId, crypto.randomUUID()), name }),
    v.parse(EpochMs, 0),
  );
}

describe("ratings told to the lobby after a game", () => {
  it("gives every player of a ranked game that just ended their new rating", () => {
    const room = endedRoom("ranked");
    const ratings = ratingsAfterGameOf(null, room);
    expect(ratings.map(({ rating }) => rating).sort()).toEqual([1000, 1020, 980].sort());
    expect(ratings.map(({ playerId }) => playerId).sort()).toEqual(
      room.players.map(({ playerId }) => playerId).sort(),
    );
  });

  it("gives no ratings for a casual game or a game that had already ended", () => {
    const ranked = endedRoom("ranked");
    expect(ratingsAfterGameOf(null, endedRoom("casual"))).toEqual([]);
    expect(ratingsAfterGameOf(ranked, ranked)).toEqual([]);
  });
});
