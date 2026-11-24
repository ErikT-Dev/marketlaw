import type { ScorePartsInHundredths } from "./ScorePartsInHundredths";
import type { SeatNumber } from "./SeatNumber";
import type { SummaryCounts } from "./SummaryCounts";

export type PlaceResult = {
  readonly seat: SeatNumber;
  readonly score: number;
  readonly scorePartsInHundredths: ScorePartsInHundredths;
  readonly bonusTypePoints: number;
  readonly leftInTurn: number | null;
  readonly hasReachedEndGoal: boolean;
  readonly income: number;
  readonly funds: number;
  readonly cardsInHand: number;
  readonly counts: SummaryCounts;
};
