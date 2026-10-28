import type { CardName } from "../shared/catalogue/CardName";
import type { DiscardShuffle } from "./DiscardShuffle";
import type { Piles } from "./Piles";

export type Drawn = {
  readonly piles: Piles;
  readonly cards: ReadonlyArray<CardName>;
  readonly shuffles: ReadonlyArray<DiscardShuffle>;
};
