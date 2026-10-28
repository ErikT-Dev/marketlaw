import type { Card } from "../shared/catalogue/Card";
import { sameSectorAndTierInCityOf } from "./sameSectorAndTierInCityOf";
import type { SeatState } from "./SeatState";

export function realCostOf(card: Card, seat: SeatState): number {
  return card.baseCost + sameSectorAndTierInCityOf(card, seat);
}
