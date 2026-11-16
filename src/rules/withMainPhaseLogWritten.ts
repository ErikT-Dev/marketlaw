import type { GameState } from "./GameState";
import { seatsInPlayerOrderOf } from "./seatsInPlayerOrderOf";

export function withMainPhaseLogWritten(state: GameState): GameState {
  return {
    ...state,
    mainPhaseLog: [
      ...state.mainPhaseLog,
      ...seatsInPlayerOrderOf(state).flatMap((seat) => seat.logEntriesThisMainPhase),
    ],
    seats: state.seats.map((seat) => ({ ...seat, logEntriesThisMainPhase: [] })),
  };
}
