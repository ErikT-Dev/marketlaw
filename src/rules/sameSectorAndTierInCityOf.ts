import type { Card } from "../shared/catalogue/Card";
import { cardOf } from "../shared/catalogue/cardOf";
import type { SeatState } from "./SeatState";

export function sameSectorAndTierInCityOf(card: Card, seat: SeatState): number {
  return seat.city
    .map(cardOf)
    .filter((inCity) => inCity.sector === card.sector && inCity.tier === card.tier).length;
}
