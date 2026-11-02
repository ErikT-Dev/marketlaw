import { TURN_LIMIT } from "../shared/TURN_LIMIT";
import type { GameState } from "./GameState";
import { hasReachedEndGoal } from "./hasReachedEndGoal";

export function isFinalTurn(state: GameState): boolean {
  return state.turn >= TURN_LIMIT || state.seats.some(hasReachedEndGoal);
}
