import type { ReplayRecordStatement } from "../replays/ReplayRecordStatement";

export type GameRecordDatabase = {
  prepare(query: string): ReplayRecordStatement;
  batch(statements: ReadonlyArray<ReplayRecordStatement>): Promise<unknown>;
};
