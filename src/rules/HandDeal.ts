import type { CardName } from "../shared/catalogue/CardName";
import type { Piles } from "./Piles";

export type HandDeal = {
  readonly hand: ReadonlyArray<CardName>;
  readonly piles: Piles;
};
