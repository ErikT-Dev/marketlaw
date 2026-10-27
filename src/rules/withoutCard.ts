import type { CardName } from "../shared/catalogue/CardName";

export function withoutCard(
  cards: ReadonlyArray<CardName>,
  card: CardName,
): ReadonlyArray<CardName> {
  const index = cards.indexOf(card);
  return [...cards.slice(0, index), ...cards.slice(index + 1)];
}
