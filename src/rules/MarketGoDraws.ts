import type { CardName } from "../shared/catalogue/CardName";

export type MarketGoDraws = {
  readonly fromLogLength: number;
  readonly toLogLength: number;
  readonly drawn: ReadonlyArray<CardName>;
};
