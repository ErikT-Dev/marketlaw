import { firstCompletionFundsOf } from "./firstCompletionFundsOf";
import { firstCompletionsOf } from "./firstCompletionsOf";
import { gameResultOf } from "./gameResultOf";
import type { GameState } from "./GameState";
import type { GameEnding } from "../shared/GameEnding";
import { scoredEndingOf } from "./scoredEndingOf";

export function endGame(
  state: GameState,
  at: number,
  endedBy: GameEnding = scoredEndingOf(state),
): GameState {
  const firsts = firstCompletionsOf(state);
  const rewarded = {
    ...state,
    seats: state.seats.map((seat) => ({
      ...seat,
      stats: { ...seat.stats, funds: seat.stats.funds + firstCompletionFundsOf(seat, firsts) },
    })),
    firstCompletions: [...state.firstCompletions, ...firsts],
    discard: [...state.discard, ...state.holdingPile],
    holdingPile: [],
  };
  return { ...rewarded, phase: "ended", result: gameResultOf(rewarded, endedBy), clockStartedAt: at };
}
