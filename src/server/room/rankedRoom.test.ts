import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import type { RankedPlayer } from "./RankedPlayer";
import type { RoomRecord } from "./RoomRecord";
import { startRankedRoomIn } from "./startRankedRoomIn";

const NOW = v.parse(EpochMs, 7_000_000);
const CODE = v.parse(RoomCode, "R4NK3D");
const ANN: RankedPlayer = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Ann",
  rating: 1043,
  rankedGames: 12,
  highestRating: 1060,
};
const BEA: RankedPlayer = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Bea",
  rating: 1000,
  rankedGames: 0,
  highestRating: 1000,
};

function startedRoom(players: ReadonlyArray<RankedPlayer>): RoomRecord | null {
  let kept: RoomRecord | null = null;
  const storage = {
    read: () => kept ?? undefined,
    write: (record: RoomRecord) => {
      kept = record;
    },
    remove: () => {
      kept = null;
    },
  };
  const start = {
    seed: 3,
    now: NOW,
    seatOrder: (ids: ReadonlyArray<PlayerId>) => [...ids].reverse(),
  };
  startRankedRoomIn(storage, { code: CODE, size: 2, playersInQueueOrder: players }, start);
  return kept;
}

describe("a ranked room", () => {
  it("is private, owned by the longest waiting player and plays a ranked game at once", () => {
    const room = startedRoom([ANN, BEA]);
    expect(room?.isPublic).toBe(false);
    expect(room?.players[0]).toEqual({ playerId: ANN.playerId, name: "Ann" });
    expect(room?.waiting.asking).toBeNull();
    expect(room?.game?.kind).toBe("ranked");
    expect(room?.game?.saved.state.kind).toBe("ranked");
    expect(room?.game?.seats.map(({ name }) => name)).toEqual(["Bea", "Ann"]);
  });

  it("keeps every player's rating, ranked games and highest rating from the start", () => {
    const room = startedRoom([ANN, BEA]);
    expect(room?.game?.ratingsBeforeGame).toEqual([
      { playerId: ANN.playerId, rating: 1043, rankedGames: 12, highestRating: 1060 },
      { playerId: BEA.playerId, rating: 1000, rankedGames: 0, highestRating: 1000 },
    ]);
  });

  it("is not made when the players do not fill the game size", () => {
    expect(startedRoom([ANN])).toBeNull();
  });
});
