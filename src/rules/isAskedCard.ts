import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { DrawAsked } from "../shared/DrawAsked";

export function isAskedCard(name: CardName, asked: DrawAsked): boolean {
  const card = cardOf(name);
  const isSameTarget =
    asked.by === "sector" ? card.sector === asked.sector : kindOf(card) === asked.kind;
  return isSameTarget && card.tier === asked.tier;
}
