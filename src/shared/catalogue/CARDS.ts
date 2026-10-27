import cardList from "../../../harness/spec/cards.json" with { type: "json" };
import type { Card } from "./Card";
import { parseCards } from "./parseCards";

function loadCards(): ReadonlyArray<Card> {
  const parsed = parseCards(cardList);
  if (!parsed.isOk) {
    throw new Error(`cards.json does not match the card schema:\n${parsed.error.join("\n")}`);
  }
  return parsed.value;
}

export const CARDS: ReadonlyArray<Card> = loadCards();
