import type { SeatNumber } from "./SeatNumber";

export type PlaceResult = {
  readonly seat: SeatNumber;
  readonly score: number;
  readonly bonusTypePoints: number;
  readonly hasLeft: boolean;
};
