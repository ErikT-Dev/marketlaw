import type { CardName } from "../shared/catalogue/CardName";

export function removeCards(
  from: ReadonlyArray<CardName>,
  cards: ReadonlyArray<CardName>,
): ReadonlyArray<CardName> | undefined {
  let left = from;
  for (const card of cards) {
    const index = left.indexOf(card);
    if (index < 0) {
      return undefined;
    }
    left = [...left.slice(0, index), ...left.slice(index + 1)];
  }
  return left;
}
