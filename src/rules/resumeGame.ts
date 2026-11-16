import { decisionOf } from "./decisionOf";
import type { GameState } from "./GameState";

export function resumeGame(state: GameState, at: number): GameState {
  const { pause } = state;
  if (pause === null) {
    return state;
  }
  const pausedMs = at - pause.at;
  return {
    ...state,
    clockStartedAt: state.clockStartedAt + pausedMs,
    seats: state.seats.map((seat) =>
      seat.mainPhaseStartedAt === null
        ? seat
        : { ...seat, mainPhaseStartedAt: seat.mainPhaseStartedAt + pausedMs },
    ),
    pause: null,
    grace: [
      ...state.grace
        .filter(({ seat }) => !pause.seats.includes(seat))
        .map((grace) => ({ ...grace, until: grace.until + pausedMs })),
      ...pause.seats.flatMap((seat) => {
        const decision = decisionOf(state, seat);
        return decision === null ? [] : [{ seat, until: at + decision.freeMs }];
      }),
    ],
  };
}
