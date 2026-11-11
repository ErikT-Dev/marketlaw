import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";

export function seatShownTo(state: GameState, seat: SeatState, viewer: SeatNumber): SeatState {
  if (seat.seat === viewer || state.phase === "ended") {
    return seat;
  }
  return state.mainPhaseStart.seats.find((start) => start.seat === seat.seat) ?? seat;
}
