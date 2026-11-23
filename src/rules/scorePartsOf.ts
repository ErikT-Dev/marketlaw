import type { ScorePartsInHundredths } from "../shared/ScorePartsInHundredths";
import { wholeFundsOf } from "../shared/wholeFundsOf";
import { cardsInHandScoredOf } from "./cardsInHandScoredOf";
import { SCORE_HUNDREDTHS } from "./SCORE_HUNDREDTHS";
import type { SeatState } from "./SeatState";

export function scorePartsOf(seat: SeatState, bonusTypePoints: number): ScorePartsInHundredths {
  const { stats } = seat;
  return {
    income: SCORE_HUNDREDTHS.income * stats.income,
    workforce: SCORE_HUNDREDTHS.workforce * stats.workforce,
    quality: SCORE_HUNDREDTHS.quality * stats.quality,
    satisfaction: SCORE_HUNDREDTHS.satisfaction * stats.satisfaction,
    product: SCORE_HUNDREDTHS.product * stats.product,
    distribution: SCORE_HUNDREDTHS.distribution * stats.distribution,
    fundsAndHand:
      SCORE_HUNDREDTHS.fundsAndCardsInHand * (wholeFundsOf(stats.funds) + cardsInHandScoredOf(seat)),
    bonusTypes: SCORE_HUNDREDTHS.bonusTypePoint * bonusTypePoints,
  };
}
