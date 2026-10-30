import type { EpochMs } from "./EpochMs";

export type SeatClock = {
  readonly bankMs: number;
  readonly freeUntil: EpochMs;
  readonly deadline: EpochMs;
};
