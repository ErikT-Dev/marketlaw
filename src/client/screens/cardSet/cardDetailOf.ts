import type { Card } from "../../../shared/catalogue/Card";
import type { CardStats } from "../../../shared/catalogue/CardStats";
import type { CardDetail } from "./CardDetail";
import type { CardStatAmount } from "./CardStatAmount";
import { SECTOR_STAT_EFFECTS } from "../../components/SECTOR_STAT_EFFECTS";

function amountsOf(
  card: Card,
  stats: ReadonlyArray<keyof CardStats>,
): ReadonlyArray<CardStatAmount> {
  return stats
    .map((stat) => ({ stat, amount: card.stats[stat] }))
    .filter(({ amount }) => amount > 0);
}

export function cardDetailOf(card: Card): CardDetail {
  const { gives, usesUp } = SECTOR_STAT_EFFECTS[card.sector];
  return {
    card,
    gives: amountsOf(card, gives),
    usesUp: amountsOf(card, usesUp),
    types: card.types.filter(({ count }) => count === 1).map(({ type }) => type),
    doubleTypes: card.types.filter(({ count }) => count === 2).map(({ type }) => type),
  };
}
