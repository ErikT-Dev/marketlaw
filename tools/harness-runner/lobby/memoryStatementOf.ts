import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { ReplayRecordStatement } from "../../../src/server/replays/ReplayRecordStatement.ts";

export function memoryStatementOf(
  sqlite: DatabaseSync,
  query: string,
  values: ReadonlyArray<SQLInputValue>,
): ReplayRecordStatement {
  return {
    bind: (...bound) => memoryStatementOf(sqlite, query, bound),
    run: async () => Promise.resolve(sqlite.prepare(query).run(...values)),
    first: async (column) =>
      Promise.resolve(sqlite.prepare(query).get(...values)?.[column] ?? null),
  };
}
