import type { CardName } from "../shared/catalogue/CardName";

export type Piles = {
  readonly deck: ReadonlyArray<CardName>;
  readonly discard: ReadonlyArray<CardName>;
};
