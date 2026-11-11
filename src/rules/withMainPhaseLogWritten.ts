import type { GameState } from "./GameState";

export function withMainPhaseLogWritten(state: GameState): GameState {
  const first = Math.max(
    0,
    state.seats.findIndex((seat) => seat.seat === state.firstPlayer),
  );
  const inPlayerOrder = [...state.seats.slice(first), ...state.seats.slice(0, first)];
  return {
    ...state,
    mainPhaseLog: [
      ...state.mainPhaseLog,
      ...inPlayerOrder.flatMap((seat) => seat.logEntriesThisMainPhase),
    ],
    seats: state.seats.map((seat) => ({ ...seat, logEntriesThisMainPhase: [] })),
  };
}
