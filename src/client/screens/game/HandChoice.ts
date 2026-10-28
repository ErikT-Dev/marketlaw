import type { CardName } from "../../../shared/catalogue/CardName";

export type HandChoice =
  | { readonly mode: "choosing"; readonly selected: CardName | null }
  | { readonly mode: "selling"; readonly marked: ReadonlyArray<CardName> };
