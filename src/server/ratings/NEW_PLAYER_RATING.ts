import { RATING_RULES } from "./RATING_RULES";
import type { RatingBeforeGame } from "./RatingBeforeGame";

export const NEW_PLAYER_RATING: RatingBeforeGame = {
  rating: RATING_RULES.startingRating,
  rankedGames: 0,
  highestRating: RATING_RULES.startingRating,
};
