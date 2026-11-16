import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { kindTierCountsOf } from "./kindTierCountsOf";
import { seatOf } from "./seatOf";

export function withOwnMainPhaseStart(state: GameState, seatNumber: SeatNumber): GameState {
  const seat = seatOf(state, seatNumber);
  const start = state.mainPhaseStart;
  if (seat === undefined || start.seats.some((started) => started.seat === seatNumber)) {
    return state;
  }
  const piles = {
    seat: seatNumber,
    deckCount: state.deck.length,
    kindTierCounts: kindTierCountsOf([...state.deck, ...state.discard]),
    discard: state.discard,
    drawLogLength: state.drawLog.length,
  };
  return {
    ...state,
    mainPhaseStart: { ...start, seats: [...start.seats, seat], piles: [...start.piles, piles] },
  };
}
