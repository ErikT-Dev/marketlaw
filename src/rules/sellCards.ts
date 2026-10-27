import type { CardName } from "../shared/catalogue/CardName";
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
    stats: { ...current.stats, funds: current.stats.funds + cards.length },
    hand: cards.reduce(withoutCard, current.hand),
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  return { ...sold, holdingPile: [...sold.holdingPile, ...cards] };
}
