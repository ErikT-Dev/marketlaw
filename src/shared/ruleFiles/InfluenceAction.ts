import type { Tier } from "../catalogue/Tier";
import type { StatAmounts } from "../StatAmounts";

export type InfluenceAction =
  | {
      readonly kind: "trade";
      readonly name: string;
      readonly costs: StatAmounts;
      readonly gains: StatAmounts;
      readonly buildPasses: number;
      readonly isPriceRising: boolean;
      readonly limitPerGame: number | null;
    }
  | {
      readonly kind: "draw";
      readonly name: string;
      readonly costs: StatAmounts;
      readonly tier: Tier;
      readonly limitPerGame: number | null;
    };
