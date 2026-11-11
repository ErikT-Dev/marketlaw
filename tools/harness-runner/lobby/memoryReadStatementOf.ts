import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { RecordReadStatement } from "../../../src/server/records/RecordReadStatement.ts";

export function memoryReadStatementOf(
  sqlite: DatabaseSync,
  query: string,
  values: ReadonlyArray<SQLInputValue>,
): RecordReadStatement {
  return {
    bind: (...bound) => memoryReadStatementOf(sqlite, query, bound),
    all: async () => Promise.resolve({ results: sqlite.prepare(query).all(...values) }),
  };
}
