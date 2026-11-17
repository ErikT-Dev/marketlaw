import * as v from "valibot";
import type { AccountRating } from "../../shared/api/AccountRating";
import type { PlayerId } from "../../shared/PlayerId";
import { NEW_PLAYER_RATING } from "./NEW_PLAYER_RATING";

const ACCOUNT_RATING_ROW = v.object({
  kind: v.picklist(["guest", "registered"]),
  rating: v.nullable(v.number()),
  rankedGames: v.nullable(v.number()),
});

export async function accountRatingOf(
  db: D1Database,
  playerId: PlayerId,
): Promise<AccountRating | null> {
  const row = await db
    .prepare(
      "SELECT players.kind, ratings.rating, ratings.ranked_games AS rankedGames FROM players " +
        "LEFT JOIN ratings ON ratings.player_id = players.id WHERE players.id = ?",
    )
    .bind(playerId)
    .first();
  const parsed = v.safeParse(ACCOUNT_RATING_ROW, row);
  if (!parsed.success || parsed.output.kind === "guest") {
    return null;
  }
  return {
    rating: parsed.output.rating ?? NEW_PLAYER_RATING.rating,
    rankedGames: parsed.output.rankedGames ?? NEW_PLAYER_RATING.rankedGames,
  };
}
