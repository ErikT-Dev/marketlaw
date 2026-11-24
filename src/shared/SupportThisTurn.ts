import type { SeatNumber } from "./SeatNumber";

export type SupportThisTurn = {
  readonly seat: SeatNumber;
  readonly funds: number;
};
