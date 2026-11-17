import type { PlayerId } from "../../shared/PlayerId";
import { NEW_PLAYER_RATING } from "./NEW_PLAYER_RATING";
import type { PlayerRatingBeforeGame } from "./PlayerRatingBeforeGame";
import type { RatingBeforeGame } from "./RatingBeforeGame";

export function ratingBeforeGameOf(
  ratings: ReadonlyArray<PlayerRatingBeforeGame>,
  playerId: PlayerId,
): RatingBeforeGame {
  const kept = ratings.find((rating) => rating.playerId === playerId);
  return kept === undefined
    ? NEW_PLAYER_RATING
    : { rating: kept.rating, rankedGames: kept.rankedGames, highestRating: kept.highestRating };
}
