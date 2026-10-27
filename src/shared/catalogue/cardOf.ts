import type { Card } from "./Card";
import type { CardName } from "./CardName";
import { CARDS } from "./CARDS";

const CARDS_BY_NAME = new Map(CARDS.map((card) => [card.name, card]));

export function cardOf(name: CardName): Card {
  const card = CARDS_BY_NAME.get(name);
  if (card === undefined) {
    throw new Error(`no card named ${name}`);
  }
  return card;
}
