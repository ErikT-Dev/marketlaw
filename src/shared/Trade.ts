import type { StatAmounts } from "./StatAmounts";

export type Trade = {
  readonly costs: StatAmounts;
  readonly gains: StatAmounts;
  readonly doesGiveBuildPass: boolean;
  readonly limitPerGame: number | null;
};
