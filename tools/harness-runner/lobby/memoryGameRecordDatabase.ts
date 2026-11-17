import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { MemoryGameRecords } from "./MemoryGameRecords.ts";
import { memoryReadStatementOf } from "./memoryReadStatementOf.ts";
import { memoryStatementOf } from "./memoryStatementOf.ts";

const MIGRATIONS = ["0012_game_records.sql", "0014_ratings.sql"].map(
  (file) => new URL(`../../../migrations/${file}`, import.meta.url),
);

function countOf(sqlite: DatabaseSync, table: string): number {
  const counted = sqlite.prepare(`SELECT COUNT(*) AS counted FROM ${table}`).get()?.["counted"];
  return typeof counted === "number" ? counted : 0;
}

export function memoryGameRecordDatabase(): MemoryGameRecords {
  const sqlite = new DatabaseSync(":memory:");
  for (const migration of MIGRATIONS) {
    sqlite.exec(readFileSync(migration, "utf8"));
  }
  return {
    database: {
      prepare: (query) => memoryStatementOf(sqlite, query, []),
      batch: async (statements) => {
        sqlite.exec("BEGIN");
        await Promise.all(statements.map(async (statement) => statement.run()));
        sqlite.exec("COMMIT");
      },
    },
    reader: { prepare: (query) => memoryReadStatementOf(sqlite, query, []) },
    rowCounts: () => ({
      records: countOf(sqlite, "game_records"),
      players: countOf(sqlite, "game_record_players"),
      ratings: countOf(sqlite, "ratings"),
    }),
    giveRating: ({ playerId, rating, rankedGames, highestRating }) => {
      sqlite
        .prepare(
          "INSERT INTO ratings (player_id, rating, ranked_games, highest_rating) VALUES (?, ?, ?, ?)",
        )
        .run(playerId, rating, rankedGames, highestRating);
    },
    ratingOf: (playerId) => {
      const row = sqlite
        .prepare("SELECT rating, ranked_games, highest_rating FROM ratings WHERE player_id = ?")
        .get(playerId);
      const rating = row?.["rating"];
      const rankedGames = row?.["ranked_games"];
      const highestRating = row?.["highest_rating"];
      return typeof rating === "number" &&
        typeof rankedGames === "number" &&
        typeof highestRating === "number"
        ? { rating, rankedGames, highestRating }
        : null;
    },
  };
}
