import type { CardStats } from "../../../shared/catalogue/CardStats";

export type CardStatAmount = {
  readonly stat: keyof CardStats;
  readonly amount: number;
};
