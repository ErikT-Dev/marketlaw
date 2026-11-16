import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { RankedGameSize } from "../../shared/RankedGameSize";
import type { QueueEntry } from "./QueueEntry";

export type QueueMatch = {
  readonly players: ReadonlyArray<QueueEntry>;
  readonly size: RankedGameSize;
  readonly deadline: EpochMs;
  readonly confirmed: ReadonlyArray<PlayerId>;
};
