import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { RecordResult } from "../../../src/shared/records/RecordResult.ts";

export type FixturePlayer = {
  readonly playerId: PlayerId;
  readonly place: number;
  readonly score: number;
  readonly result: RecordResult;
};
