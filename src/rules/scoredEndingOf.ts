import type { GameEnding } from "../shared/GameEnding";
import type { GameState } from "./GameState";
import { hasReachedEndGoal } from "./hasReachedEndGoal";

export function scoredEndingOf(state: GameState): GameEnding {
  return state.seats.some(hasReachedEndGoal) ? "end_goal" : "turn_limit";
}
