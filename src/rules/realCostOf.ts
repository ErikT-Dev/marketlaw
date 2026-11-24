import type { Card } from "../shared/catalogue/Card";
import { sameSectorAndTierInCityOf } from "./sameSectorAndTierInCityOf";
import type { SeatState } from "./SeatState";

const REAL_COST_PER_SAME_SECTOR_AND_TIER_CARD = 10;

export function realCostOf(card: Card, seat: SeatState): number {
  return card.baseCost + REAL_COST_PER_SAME_SECTOR_AND_TIER_CARD * sameSectorAndTierInCityOf(card, seat);
}
