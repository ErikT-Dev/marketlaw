import type { RatingBeforeGame } from "./RatingBeforeGame";

export function shownRatingOf({ rating, rankedGames }: RatingBeforeGame): number | null {
  return rankedGames > 0 ? rating : null;
}
