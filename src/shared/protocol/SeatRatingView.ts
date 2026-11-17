import type { SeatNumber } from "../SeatNumber";

export type SeatRatingView = {
  readonly seat: SeatNumber;
  readonly before: number;
  readonly after: number;
};
