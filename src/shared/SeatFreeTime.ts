import type { SeatNumber } from "./SeatNumber";

export type SeatFreeTime = {
  readonly seat: SeatNumber;
  readonly freeMs: number;
};
