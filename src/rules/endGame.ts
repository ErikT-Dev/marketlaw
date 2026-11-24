import { gameResultOf } from "./gameResultOf";
import type { GameState } from "./GameState";
import type { GameEnding } from "../shared/GameEnding";
import { scoredEndingOf } from "./scoredEndingOf";
import { withMainPhaseLogWritten } from "./withMainPhaseLogWritten";

export function endGame(
  unlogged: GameState,
  at: number,
  endedBy: GameEnding = scoredEndingOf(unlogged),
): GameState {
  const state = withMainPhaseLogWritten(unlogged);
  const cleared = {
    ...state,
    discard: [...state.discard, ...state.holdingPile],
    holdingPile: [],
  };
  return { ...cleared, phase: "ended", vote: null, result: gameResultOf(cleared, endedBy), clockStartedAt: at };
}
