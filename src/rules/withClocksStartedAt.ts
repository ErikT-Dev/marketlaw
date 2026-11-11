import type { GameState } from "./GameState";
import { isInOwnMainPhase } from "./isInOwnMainPhase";

export function withClocksStartedAt(state: GameState, at: number): GameState {
  return {
    ...state,
    clockStartedAt: at,
    seats: state.seats.map((seat) =>
      isInOwnMainPhase(state, seat) ? { ...seat, mainPhaseStartedAt: at } : seat,
    ),
  };
}
