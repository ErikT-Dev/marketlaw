import type { ScorePartsInHundredths } from "../../shared/ScorePartsInHundredths";

export function scorePartsAddingUpTo(score: number): ScorePartsInHundredths {
  return {
    income: 0,
    workforce: 0,
    quality: 0,
    satisfaction: 0,
    product: 0,
    distribution: 0,
    funds: 0,
    cardsInHand: 0,
    bonusTypes: score * 100,
  };
}
