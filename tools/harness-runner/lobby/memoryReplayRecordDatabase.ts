import { readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { ReplayRecordStatement } from "../../../src/server/replays/ReplayRecordStatement.ts";
import type { MemoryReplayRecords } from "./MemoryReplayRecords.ts";

const REPLAY_RECORDS_MIGRATION = new URL(
  "../../../migrations/0006_replay_records.sql",
  import.meta.url,
);

function statementOf(
  sqlite: DatabaseSync,
  query: string,
  values: ReadonlyArray<SQLInputValue>,
): ReplayRecordStatement {
  return {
    bind: (...bound) => statementOf(sqlite, query, bound),
    run: async () => Promise.resolve(sqlite.prepare(query).run(...values)),
    first: async (column) =>
      Promise.resolve(sqlite.prepare(query).get(...values)?.[column] ?? null),
  };
}

export function memoryReplayRecordDatabase(): MemoryReplayRecords {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(REPLAY_RECORDS_MIGRATION, "utf8"));
  return {
    database: { prepare: (query) => statementOf(sqlite, query, []) },
    storedCount: () => {
      const stored = sqlite.prepare("SELECT COUNT(*) AS stored FROM replay_records").get()?.[
        "stored"
      ];
      return typeof stored === "number" ? stored : 0;
    },
  };
}
