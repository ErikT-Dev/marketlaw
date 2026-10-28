import type { GameState } from "./GameState";

export function withMainPhaseStart(state: Omit<GameState, "mainPhaseStart">): GameState {
  return {
    ...state,
    mainPhaseStart: {
      seats: state.seats,
      deckCount: state.deck.length,
      discard: state.discard,
      drawLogLength: state.drawLog.length,
    },
  };
}
