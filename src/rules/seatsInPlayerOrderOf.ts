import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";

export function seatsInPlayerOrderOf(state: GameState): ReadonlyArray<SeatState> {
  const first = Math.max(
    0,
    state.seats.findIndex((seat) => seat.seat === state.firstPlayer),
  );
  return [...state.seats.slice(first), ...state.seats.slice(0, first)];
}
