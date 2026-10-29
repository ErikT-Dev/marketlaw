import { CARDS } from "../shared/catalogue/CARDS";
import type { CardName } from "../shared/catalogue/CardName";
import { kindOf } from "../shared/catalogue/kindOf";
import { kindTierKey } from "./kindTierKey";

const KIND_TIER_KEY_OF_CARD: Readonly<Partial<Record<CardName, string>>> = Object.fromEntries(
  CARDS.map((card) => [card.name, kindTierKey(kindOf(card), card.tier)]),
);

export function kindTierCountsOf(
  cards: ReadonlyArray<CardName>,
  start: Readonly<Record<string, number>> = {},
  step = 1,
): Readonly<Record<string, number>> {
  return cards.reduce<Readonly<Record<string, number>>>((counts, name) => {
    const key = KIND_TIER_KEY_OF_CARD[name] ?? name;
    return { ...counts, [key]: (counts[key] ?? 0) + step };
  }, start);
}
