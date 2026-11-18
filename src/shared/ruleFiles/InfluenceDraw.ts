import type { Tier } from "../catalogue/Tier";
import type { StatAmounts } from "../StatAmounts";

export type InfluenceDraw = {
  readonly kind: "draw";
  readonly name: string;
  readonly costs: StatAmounts;
  readonly tier: Tier;
  readonly limitPerGame: number | null;
};
