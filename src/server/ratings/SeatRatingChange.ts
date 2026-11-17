import type { SeatNumber } from "../../shared/SeatNumber";

export type SeatRatingChange = {
  readonly seat: SeatNumber;
  readonly change: number;
};
