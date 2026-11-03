import type { GameState } from "./GameState";
import { TIME_RULES } from "./TIME_RULES";

export function resumeGame(state: GameState, at: number): GameState {
  const { pause } = state;
  if (pause === null) {
    return state;
  }
  const pausedMs = at - pause.at;
  const freeMs = state.phase === "main" ? TIME_RULES.mainFreeMs : TIME_RULES.goFreeMs;
  return {
    ...state,
    clockStartedAt: state.clockStartedAt + pausedMs,
    pause: null,
    grace: [
      ...state.grace
        .filter(({ seat }) => !pause.seats.includes(seat))
        .map((grace) => ({ ...grace, until: grace.until + pausedMs })),
      ...pause.seats.map((seat) => ({ seat, until: at + freeMs })),
    ],
  };
}
