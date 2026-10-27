import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";

export function updateSeat(
  state: GameState,
  seat: SeatNumber,
  change: (current: SeatState) => SeatState,
): GameState {
  return {
    ...state,
    seats: state.seats.map((current) => (current.seat === seat ? change(current) : current)),
  };
}
