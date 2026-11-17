import { NEW_PLAYER_RATING } from "../../../src/server/ratings/NEW_PLAYER_RATING.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

type GivenRating = {
  readonly name: string;
  readonly isFixture: boolean;
  readonly rating: number;
  readonly rankedGames: number;
};

const FIXTURE_NAME = "Ranked player";
const STARTING_RATING = NEW_PLAYER_RATING.rating;

function placedRatingsOf(given: LobbyGiven): ReadonlyArray<GivenRating> {
  const placed = (given.accounts ?? []).filter((account) => account.ranking_place !== undefined);
  const total = (given.ranked_accounts ?? 0) + placed.length;
  return [...Array(total).keys()].map((index) => {
    const place = index + 1;
    const named = placed.find((account) => account.ranking_place === place)?.name;
    return {
      name: named ?? `${FIXTURE_NAME} ${String(place)}`,
      isFixture: named === undefined,
      rating: STARTING_RATING + total - index,
      rankedGames: 1,
    };
  });
}

export function givenRankingRatingsOf(given: LobbyGiven): ReadonlyArray<GivenRating> {
  const rated = (given.accounts ?? [])
    .filter(
      (account) =>
        account.ranking_place === undefined &&
        (account.rating !== undefined || account.ranked_games !== undefined),
    )
    .map((account) => ({
      name: account.name,
      isFixture: false,
      rating: account.rating ?? STARTING_RATING,
      rankedGames: account.ranked_games ?? 0,
    }));
  return [...placedRatingsOf(given), ...rated];
}
