import type { CardName } from "../shared/catalogue/CardName";
import type { Piles } from "./Piles";

export type Drawn = {
  readonly piles: Piles;
  readonly cards: ReadonlyArray<CardName>;
};
