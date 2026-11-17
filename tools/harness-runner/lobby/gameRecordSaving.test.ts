import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { endGame } from "../../../src/rules/endGame.ts";
import { saveGameRecord } from "../../../src/server/records/saveGameRecord.ts";
import type { StoredGameRecord } from "../../../src/server/records/StoredGameRecord.ts";
import { storedGameRecordOf } from "../../../src/server/records/storedGameRecordOf.ts";
import type { RoomGame } from "../../../src/server/room/RoomGame.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { GameId } from "../../../src/shared/GameId.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";

const ENDED_MS = 5000;

function endedGame(): RoomGame {
  const { game } = lobbyRoomFromGiven(
    {
      code: "K7QR2P",
      size: 3,
      public: true,
      players: ["Ann", "Bea", "Cat"],
      state: "ended",
      ended_ms: ENDED_MS,
    },
    (name) => ({ playerId: v.parse(PlayerId, crypto.randomUUID()), name }),
    v.parse(EpochMs, 0),
  );
  if (game === null) {
    throw new Error("the ended room has no game");
  }
  return game;
}

function ratingAtPlace(record: StoredGameRecord | null, place: number): unknown {
  const seat = record?.seats.find((recorded) => recorded.place === place)?.seat;
  return record?.players.find((player) => player.seat === seat)?.rating;
}

function rankedGame(game: RoomGame): RoomGame {
  return { ...game, kind: "ranked" };
}

describe("saving game records", () => {
  it("stores the players' ids, the kind and the start and end times with the record", () => {
    const game = endedGame();
    const record = storedGameRecordOf(game);
    expect(record?.players).toEqual(
      game.seats.map(({ seat, playerId }) => ({ seat, playerId, rating: null })),
    );
    expect(record?.kind).toBe("casual");
    expect(record?.startedMs).toBe(game.saved.setup.startedAt);
    expect(record?.endedMs).toBe(ENDED_MS);
    expect(JSON.stringify(record)).not.toContain("Ann");
  });

  it("writes one record row and one row per player", async () => {
    const records = memoryGameRecordDatabase();
    const record = storedGameRecordOf(endedGame());
    if (record === null) {
      throw new Error("the ended game has no record");
    }
    await saveGameRecord(records.database, v.parse(GameId, crypto.randomUUID()), record);
    expect(records.rowCounts()).toEqual({ records: 1, players: 3, ratings: 0 });
  });

  it("keeps each player's rating before a ranked game and the change from their place", () => {
    const game = rankedGame(endedGame());
    const record = storedGameRecordOf(game);
    expect([1, 2, 3].map((place) => ratingAtPlace(record, place))).toEqual([
      { before: 1000, change: 20 },
      { before: 1000, change: 0 },
      { before: 1000, change: -20 },
    ]);
  });

  it("adds a ranked game's changes to the ratings the players have when it ends", async () => {
    const records = memoryGameRecordDatabase();
    const game = rankedGame(endedGame());
    const record = storedGameRecordOf(game);
    const winner = record?.seats.find(({ place }) => place === 1)?.seat;
    const winnerId = game.seats.find(({ seat }) => seat === winner)?.playerId;
    if (record === null || winnerId === undefined) {
      throw new Error("the ended game has no record");
    }
    game.seats.forEach(({ playerId }) => {
      records.addPlayer(playerId);
    });
    records.giveRating({ playerId: winnerId, rating: 2395, rankedGames: 40, highestRating: 2395 });
    await saveGameRecord(records.database, v.parse(GameId, crypto.randomUUID()), record);
    expect(records.rowCounts()).toEqual({ records: 1, players: 3, ratings: 3 });
    expect(records.ratingOf(winnerId)).toEqual({
      rating: 2415,
      rankedGames: 41,
      highestRating: 2415,
    });
  });

  it("gives no rating to a player whose account was deleted during a ranked game", async () => {
    const records = memoryGameRecordDatabase();
    const game = rankedGame(endedGame());
    const record = storedGameRecordOf(game);
    if (record === null) {
      throw new Error("the ended game has no record");
    }
    const [deleted, ...kept] = game.seats.map(({ playerId }) => playerId);
    kept.forEach((playerId) => {
      records.addPlayer(playerId);
    });
    await saveGameRecord(records.database, v.parse(GameId, crypto.randomUUID()), record);
    expect(records.rowCounts()).toEqual({ records: 1, players: 3, ratings: 2 });
    expect(deleted === undefined ? undefined : records.ratingOf(deleted)).toBe(null);
  });

  it("keeps no record of an abandoned game", () => {
    const game = endedGame();
    const abandoned = endGame(game.saved.state, ENDED_MS, "everyone_left");
    expect(storedGameRecordOf({ ...game, saved: { ...game.saved, state: abandoned } })).toBe(null);
  });
});
