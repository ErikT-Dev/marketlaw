import type { SeatNumber } from "./SeatNumber";

export type IncomeGainedLastTurn = {
  readonly seat: SeatNumber;
  readonly income: number;
};
