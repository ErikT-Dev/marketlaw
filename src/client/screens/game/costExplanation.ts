import type { Card } from "../../../shared/catalogue/Card";
import type { HandCardDetails } from "../../../shared/HandCardDetails";

export function costExplanation(card: Card, details: HandCardDetails): string {
  const count = details.sameSectorAndTierInCity;
  if (count === 0) {
    return `Base cost ${String(card.baseCost)}.`;
  }
  return `Base cost ${String(card.baseCost)}, plus ${String(details.realCost - card.baseCost)} for the ${String(count)} ${card.sector} tier ${String(card.tier)} ${count === 1 ? "card" : "cards"} already in your city.`;
}
