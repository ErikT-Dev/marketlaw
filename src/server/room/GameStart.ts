import type { EpochMs } from "../../shared/EpochMs";

export type GameStart = {
  readonly seed: number;
  readonly now: EpochMs;
};
