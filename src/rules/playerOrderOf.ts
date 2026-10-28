import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";

export function playerOrderOf(state: GameState): ReadonlyArray<SeatNumber> {
  const seatCount = state.seats.length;
  const firstSeatIndex = (state.turn - 1) % seatCount;
  return [...state.seats.slice(firstSeatIndex), ...state.seats.slice(0, firstSeatIndex)]
    .filter((seat) => !seat.hasLeft)
    .map((seat) => seat.seat);
}
