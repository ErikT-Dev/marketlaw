import * as v from "valibot";
import { describe, expect, it } from "vitest";
import type { GameRecordDatabase } from "../../../src/server/records/GameRecordDatabase.ts";
import { saveGameRecordIfEnded } from "../../../src/server/records/saveGameRecordIfEnded.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";
import type { MemoryGameRecords } from "./MemoryGameRecords.ts";

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

function recordsWithPlayersOf(room: RoomRecord): MemoryGameRecords {
  const records = memoryGameRecordDatabase();
  room.players.forEach(({ playerId }) => {
    records.addPlayer(playerId);
  });
  return records;
}

function failingDatabase(records: MemoryGameRecords): GameRecordDatabase {
  return {
    prepare: (query) => records.database.prepare(query),
    batch: async () => Promise.reject(new Error("the database is unavailable")),
  };
}

function storedRatingOf(records: MemoryGameRecords, playerId: PlayerId): unknown {
  return { playerId, rating: records.ratingOf(playerId)?.rating };
}

describe("ratings told to the lobby after a game", () => {
  it("gives every player of a ranked game that just ended their stored rating", async () => {
    const room = endedRoom("ranked");
    const records = recordsWithPlayersOf(room);
    const [first] = room.players;
    if (first === undefined) {
      throw new Error("the ended room has no players");
    }
    records.giveRating({
      playerId: first.playerId,
      rating: 1500,
      rankedGames: 12,
      highestRating: 1500,
    });
    const ratings = await saveGameRecordIfEnded(records.database, null, room);
    expect(ratings).toHaveLength(3);
    expect(ratings).toEqual(
      expect.arrayContaining(room.players.map(({ playerId }) => storedRatingOf(records, playerId))),
    );
    expect(ratings.find(({ playerId }) => playerId === first.playerId)?.rating).toBeGreaterThan(
      1400,
    );
  });

  it("gives no rating to a player whose account was deleted during the game", async () => {
    const room = endedRoom("ranked");
    const [deleted, ...kept] = room.players;
    const records = memoryGameRecordDatabase();
    kept.forEach(({ playerId }) => {
      records.addPlayer(playerId);
    });
    const ratings = await saveGameRecordIfEnded(records.database, null, room);
    expect(ratings.map(({ playerId }) => playerId).sort()).toEqual(
      kept.map(({ playerId }) => playerId).sort(),
    );
    expect(ratings.some(({ playerId }) => playerId === deleted?.playerId)).toBe(false);
  });

  it("gives no ratings when saving the game record fails", async () => {
    const room = endedRoom("ranked");
    const records = recordsWithPlayersOf(room);
    expect(await saveGameRecordIfEnded(failingDatabase(records), null, room)).toEqual([]);
  });

  it("gives no ratings for a casual game or a game that had already ended", async () => {
    const ranked = endedRoom("ranked");
    const casual = endedRoom("casual");
    expect(
      await saveGameRecordIfEnded(recordsWithPlayersOf(casual).database, null, casual),
    ).toEqual([]);
    expect(
      await saveGameRecordIfEnded(recordsWithPlayersOf(ranked).database, ranked, ranked),
    ).toEqual([]);
  });
});
