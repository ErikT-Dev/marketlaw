import { RATING_RULES } from "./RATING_RULES";
import type { RatingBeforeGame } from "./RatingBeforeGame";

function tableK({ rankedGames, highestRating }: RatingBeforeGame): number {
  if (highestRating >= RATING_RULES.strongFromRating) {
    return RATING_RULES.strongPlayerK;
  }
  return rankedGames >= RATING_RULES.experiencedFromGames
    ? RATING_RULES.experiencedPlayerK
    : RATING_RULES.newPlayerK;
}

export function kFactorOf(player: RatingBeforeGame, playerCount: number): number {
  return (tableK(player) * 2) / (playerCount - 1);
}
