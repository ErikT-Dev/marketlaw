import type { SeatState } from "./SeatState";

export function withTurnBuildPass(seat: SeatState): SeatState {
  return seat.departure === null ? { ...seat, buildPasses: seat.buildPasses + 1 } : seat;
}
