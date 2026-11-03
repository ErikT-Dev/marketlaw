import type { SeatNumber } from "../shared/SeatNumber";

export type ClockGrace = {
  readonly seat: SeatNumber;
  readonly until: number;
};
