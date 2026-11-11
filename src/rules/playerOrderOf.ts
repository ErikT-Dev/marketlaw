import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";

export function playerOrderOf(state: GameState): ReadonlyArray<SeatNumber> {
  const first = Math.max(
    0,
    state.seats.findIndex((seat) => seat.seat === state.firstPlayer),
  );
  return [...state.seats.slice(first), ...state.seats.slice(0, first)]
    .filter((seat) => seat.departure === null)
    .map((seat) => seat.seat);
}
