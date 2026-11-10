import { cardsInHandScoredOf } from "./cardsInHandScoredOf";
import { SCORE_HUNDREDTHS } from "./SCORE_HUNDREDTHS";
import type { SeatState } from "./SeatState";

export function scoreOf(seat: SeatState, endTurn: number, bonusTypePoints: number): number {
  const { stats } = seat;
  const turn = seat.departure === null ? endTurn : seat.departure.turn;
  const hundredths =
    SCORE_HUNDREDTHS.base +
    SCORE_HUNDREDTHS.perCompletedTurn * (turn - 1) +
    SCORE_HUNDREDTHS.income * stats.income +
    SCORE_HUNDREDTHS.workforce * stats.workforce +
    SCORE_HUNDREDTHS.quality * stats.quality +
    SCORE_HUNDREDTHS.satisfaction * stats.satisfaction +
    SCORE_HUNDREDTHS.product * stats.product +
    SCORE_HUNDREDTHS.distribution * stats.distribution +
    SCORE_HUNDREDTHS.fundsAndCardsInHand * (stats.funds + cardsInHandScoredOf(seat)) +
    SCORE_HUNDREDTHS.bonusTypePoint * bonusTypePoints;
  return Math.floor(hundredths / 100);
}
