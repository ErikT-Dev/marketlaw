import type { GameState } from "./GameState";
import { isInOwnMainPhase } from "./isInOwnMainPhase";
import { withOwnMainPhaseStart } from "./withOwnMainPhaseStart";

export function withMainPhaseStart(state: Omit<GameState, "mainPhaseStart">): GameState {
  const unstarted = { ...state, mainPhaseStart: { seats: [], piles: [], marketGos: [] } };
  return state.seats
    .filter((seat) => isInOwnMainPhase(unstarted, seat))
    .reduce<GameState>((soFar, seat) => withOwnMainPhaseStart(soFar, seat.seat), unstarted);
}
