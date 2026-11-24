import type { CardName } from "../shared/catalogue/CardName";
import { FUNDS_PER_SOLD_CARD } from "../shared/FUNDS_PER_SOLD_CARD";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { withoutCard } from "./withoutCard";
import { updateSeat } from "./updateSeat";

export function sellCards(
  state: GameState,
  seat: SeatNumber,
  cards: ReadonlyArray<CardName>,
): GameState {
  const sold = updateSeat(state, seat, (current) => ({
    ...current,
    stats: { ...current.stats, funds: current.stats.funds + cards.length * FUNDS_PER_SOLD_CARD },
    hand: cards.reduce(withoutCard, current.hand),
    newCards: current.newCards.filter((card) => !cards.includes(card)),
    knownInHand: current.knownInHand.filter((card) => !cards.includes(card)),
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  return { ...sold, holdingPile: [...sold.holdingPile, ...cards] };
}
