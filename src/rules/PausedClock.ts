import type { SeatNumber } from "../shared/SeatNumber";

export type PausedClock = {
  readonly at: number;
  readonly seat: SeatNumber;
};
