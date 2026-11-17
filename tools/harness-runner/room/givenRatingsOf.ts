import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import type { PlayerRatingBeforeGame } from "../../../src/server/ratings/PlayerRatingBeforeGame.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { RoomGiven } from "./RoomGiven.ts";

export function givenRatingsOf(
  given: RoomGiven,
  identityNamed: (name: string) => Identity,
): ReadonlyArray<PlayerRatingBeforeGame> {
  return (given.accounts ?? []).flatMap((account) => {
    const isRated =
      account.rating !== undefined ||
      account.ranked_games !== undefined ||
      account.highest_rating !== undefined;
    const rating = account.rating ?? NEW_PLAYER_RATING.rating;
    return isRated
      ? [
          {
            playerId: identityNamed(account.name).playerId,
            rating,
            rankedGames: account.ranked_games ?? NEW_PLAYER_RATING.rankedGames,
            highestRating:
              account.highest_rating ?? Math.max(rating, NEW_PLAYER_RATING.highestRating),
          },
        ]
      : [];
  });
}
