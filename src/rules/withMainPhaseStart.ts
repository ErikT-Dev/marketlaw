import type { GameState } from "./GameState";

export function withMainPhaseStart(state: Omit<GameState, "mainPhaseStart">): GameState {
  return {
    ...state,
    mainPhaseStart: {
      seats: state.seats,
      deck: state.deck,
      discard: state.discard,
      drawLogLength: state.drawLog.length,
    },
  };
}
