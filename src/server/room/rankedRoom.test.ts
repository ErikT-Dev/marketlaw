import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { endGame } from "../../rules/endGame";
import type { GameEnding } from "../../shared/GameEnding";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import type { RankedPlayer } from "./RankedPlayer";
import type { RoomRecord } from "./RoomRecord";
import { startRankedRoomIn } from "./startRankedRoomIn";
import { updateFor } from "./updateFor";

const NOW = v.parse(EpochMs, 7_000_000);
const CODE = v.parse(RoomCode, "R4NK3D");
const ANN: RankedPlayer = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Ann",
  icon: TEST_PLAYER_ICON,
  rating: 1043,
  rankedGames: 12,
  highestRating: 1060,
};
const BEA: RankedPlayer = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Bea",
  icon: TEST_PLAYER_ICON,
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

function endedRoom(endedBy?: GameEnding): RoomRecord {
  const room = startedRoom([ANN, BEA]);
  if (room?.game === null || room?.game === undefined) {
    throw new Error("the ranked room did not start");
  }
  const { game } = room;
  const state = endGame(game.saved.state, NOW + 1000, endedBy);
  return { ...room, game: { ...game, saved: { ...game.saved, state } } };
}

describe("a ranked room", () => {
  it("is private, owned by the longest waiting player and plays a ranked game at once", () => {
    const room = startedRoom([ANN, BEA]);
    expect(room?.isPublic).toBe(false);
    expect(room?.players[0]).toEqual({ playerId: ANN.playerId, name: "Ann", icon: ANN.icon });
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

  it("sends no ratings while the game is in progress", () => {
    const room = startedRoom([ANN, BEA]);
    expect(room === null ? undefined : updateFor(room, ANN.playerId).room.ratings).toBeNull();
  });

  it("sends every seat's rating before and after the game once the game has ended", () => {
    const room = endedRoom();
    expect(room.game?.saved.state.result?.places.map(({ seat }) => seat)).toEqual([1, 2]);
    expect(updateFor(room, ANN.playerId).room.ratings).toEqual([
      { seat: 1, before: 1000, after: 1022 },
      { seat: 2, before: 1043, after: 1021 },
    ]);
  });

  it("sends no ratings for an abandoned game, whose ratings stay the same", () => {
    expect(updateFor(endedRoom("abandoned_by_vote"), BEA.playerId).room.ratings).toBeNull();
  });

  it("sends no ratings for a casual game", () => {
    const room = endedRoom();
    const casual = room.game === null ? null : { ...room.game, kind: "casual" as const };
    expect(updateFor({ ...room, game: casual }, BEA.playerId).room.ratings).toBeNull();
  });
});
