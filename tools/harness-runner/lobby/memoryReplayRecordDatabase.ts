import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { MemoryReplayRecords } from "./MemoryReplayRecords.ts";
import { memoryStatementOf } from "./memoryStatementOf.ts";

const REPLAY_RECORDS_MIGRATION = new URL(
  "../../../migrations/0006_replay_records.sql",
  import.meta.url,
);

export function memoryReplayRecordDatabase(): MemoryReplayRecords {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(REPLAY_RECORDS_MIGRATION, "utf8"));
  return {
    database: { prepare: (query) => memoryStatementOf(sqlite, query, []) },
    storedCount: () => {
      const stored = sqlite.prepare("SELECT COUNT(*) AS stored FROM replay_records").get()?.[
        "stored"
      ];
      return typeof stored === "number" ? stored : 0;
    },
  };
}
