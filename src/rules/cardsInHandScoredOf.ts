import type { SeatState } from "./SeatState";

export function cardsInHandScoredOf(seat: SeatState): number {
  return seat.departure === null ? seat.hand.length : seat.departure.cardsInHand;
}
