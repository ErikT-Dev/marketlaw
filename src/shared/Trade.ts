import type { StatAmounts } from "./StatAmounts";

export type Trade = {
  readonly kind: "trade";
  readonly name: string;
  readonly costs: StatAmounts;
  readonly gains: StatAmounts;
  readonly buildPasses: number;
  readonly isPriceRising: boolean;
  readonly limitPerGame: number | null;
};
