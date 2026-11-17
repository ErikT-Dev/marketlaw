import type { Card } from "../../../shared/catalogue/Card";
import type { CardSetFilter } from "./CardSetFilter";

function doesCardMatch(card: Card, filter: CardSetFilter): boolean {
  const nameText = filter.nameText.trim().toLowerCase();
  return (
    (filter.sector === null || card.sector === filter.sector) &&
    (filter.tier === null || card.tier === filter.tier) &&
    (filter.type === null || card.types.some(({ type }) => type === filter.type)) &&
    card.name.toLowerCase().includes(nameText)
  );
}

export function cardsMatching(
  cards: ReadonlyArray<Card>,
  filter: CardSetFilter,
): ReadonlyArray<Card> {
  return cards.filter((card) => doesCardMatch(card, filter));
}
