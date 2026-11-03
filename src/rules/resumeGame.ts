import type { GameState } from "./GameState";
import { TIME_RULES } from "./TIME_RULES";

export function resumeGame(state: GameState, at: number): GameState {
  if (state.pause === null) {
    return state;
  }
  const freeMs = state.phase === "main" ? TIME_RULES.mainFreeMs : TIME_RULES.goFreeMs;
  return {
    ...state,
    clockStartedAt: state.clockStartedAt + (at - state.pause.at),
    pause: null,
    grace: { seat: state.pause.seat, until: at + freeMs },
  };
}
