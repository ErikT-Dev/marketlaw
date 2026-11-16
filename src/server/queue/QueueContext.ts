import type { EpochMs } from "../../shared/EpochMs";

export type QueueContext = {
  readonly now: EpochMs;
  readonly siteGamesPerDay: number;
};
