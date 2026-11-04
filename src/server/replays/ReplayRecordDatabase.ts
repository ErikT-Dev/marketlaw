import type { ReplayRecordStatement } from "./ReplayRecordStatement";

export type ReplayRecordDatabase = {
  readonly prepare: (query: string) => ReplayRecordStatement;
};
