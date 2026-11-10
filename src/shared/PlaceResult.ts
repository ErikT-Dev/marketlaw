import type { SeatNumber } from "./SeatNumber";

export type PlaceResult = {
  readonly seat: SeatNumber;
  readonly score: number;
  readonly bonusTypePoints: number;
  readonly leftInTurn: number | null;
  readonly hasReachedEndGoal: boolean;
  readonly income: number;
  readonly fundsAndHand: number;
};
