import { CARDS } from "../../../src/shared/catalogue/CARDS.ts";
import { cardsMatching } from "../../../src/client/screens/cardSet/cardsMatching.ts";
import type { CardSetFilter } from "../../../src/client/screens/cardSet/CardSetFilter.ts";

export function cardSetThen(filter: CardSetFilter) {
  const cards = cardsMatching(CARDS, filter);
  return { count: cards.length, cards: cards.map(({ name }) => name) };
}
