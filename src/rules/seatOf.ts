import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";

export function seatOf(state: GameState, seat: SeatNumber): SeatState | undefined {
  return state.seats.find((candidate) => candidate.seat === seat);
}
