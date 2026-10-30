import { firstCompletionFundsOf } from "./firstCompletionFundsOf";
import { firstCompletionsOf } from "./firstCompletionsOf";
import { gameResultOf } from "./gameResultOf";
import type { GameState } from "./GameState";

export function endGame(state: GameState, at: number): GameState {
  const firsts = firstCompletionsOf(state);
  const rewarded = {
    ...state,
    seats: state.seats.map((seat) => ({
      ...seat,
      stats: { ...seat.stats, funds: seat.stats.funds + firstCompletionFundsOf(seat, firsts) },
    })),
    firstCompletions: [...state.firstCompletions, ...firsts],
  };
  return { ...rewarded, phase: "ended", result: gameResultOf(rewarded), clockStartedAt: at };
}
