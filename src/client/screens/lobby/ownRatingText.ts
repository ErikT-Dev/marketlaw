import type { AccountRating } from "../../../shared/api/AccountRating";

export function ownRatingText({ rating, rankedGames }: AccountRating): string {
  const games = rankedGames === 1 ? "1 ranked game" : `${String(rankedGames)} ranked games`;
  return `Your rating: ${String(rating)} · ${games}`;
}
