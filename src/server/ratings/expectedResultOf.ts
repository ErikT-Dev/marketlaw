import { RATING_RULES } from "./RATING_RULES";

export function expectedResultOf(rating: number, opponentRating: number): number {
  const limit = RATING_RULES.largestCountedDifference;
  const difference = Math.min(limit, Math.max(-limit, opponentRating - rating));
  return 1 / (1 + 10 ** (difference / limit));
}
