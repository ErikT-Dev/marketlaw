import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { MemoryGameRecords } from "./MemoryGameRecords.ts";
import { memoryReadStatementOf } from "./memoryReadStatementOf.ts";
import { memoryStatementOf } from "./memoryStatementOf.ts";

const GAME_RECORDS_MIGRATION = new URL(
  "../../../migrations/0012_game_records.sql",
  import.meta.url,
);

function countOf(sqlite: DatabaseSync, table: string): number {
  const counted = sqlite.prepare(`SELECT COUNT(*) AS counted FROM ${table}`).get()?.["counted"];
  return typeof counted === "number" ? counted : 0;
}

export function memoryGameRecordDatabase(): MemoryGameRecords {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(GAME_RECORDS_MIGRATION, "utf8"));
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
    }),
  };
}
