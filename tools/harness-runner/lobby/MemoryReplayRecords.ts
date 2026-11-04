import type { ReplayRecordDatabase } from "../../../src/server/replays/ReplayRecordDatabase.ts";

export type MemoryReplayRecords = {
  readonly database: ReplayRecordDatabase;
  readonly storedCount: () => number;
};
