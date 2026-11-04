import type { GameState } from "./GameState";
import { TIME_RULES } from "./TIME_RULES";

export function pausedAbandonDeadline(state: GameState): number | null {
  return state.pause === null ? null : state.pause.at + TIME_RULES.pausedAbandonMs;
}
