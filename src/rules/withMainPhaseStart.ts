import type { GameState } from "./GameState";
import { kindTierCountsOf } from "./kindTierCountsOf";

export function withMainPhaseStart(state: Omit<GameState, "mainPhaseStart">): GameState {
  return {
    ...state,
    mainPhaseStart: {
      seats: state.seats,
      deckCount: state.deck.length,
      kindTierCounts: kindTierCountsOf([...state.deck, ...state.discard]),
      discard: state.discard,
      drawLogLength: state.drawLog.length,
    },
  };
}
