import { endGame } from "./endGame";
import type { GameState } from "./GameState";

export function abandonPausedGame(state: GameState, at: number): GameState {
  return endGame({ ...state, pause: null }, at, "paused_too_long");
}
