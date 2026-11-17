import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import type { RecordReadDatabase } from "../records/RecordReadDatabase";
import type { RankedPlayer } from "../room/RankedPlayer";
import { NEW_PLAYER_RATING } from "./NEW_PLAYER_RATING";

const RANKED_PLAYER_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  rating: v.nullable(v.number()),
  rankedGames: v.nullable(v.number()),
  highestRating: v.nullable(v.number()),
});

function rankedPlayerOf(row: unknown): RankedPlayer {
  const { id, name, rating, rankedGames, highestRating } = v.parse(RANKED_PLAYER_ROW, row);
  return {
    playerId: id,
    name,
    rating: rating ?? NEW_PLAYER_RATING.rating,
    rankedGames: rankedGames ?? NEW_PLAYER_RATING.rankedGames,
    highestRating: highestRating ?? NEW_PLAYER_RATING.highestRating,
  };
}

export async function readRankedPlayers(
  db: RecordReadDatabase,
  playerIds: ReadonlyArray<PlayerId>,
): Promise<ReadonlyMap<PlayerId, RankedPlayer>> {
  const asked = [...new Set(playerIds)];
  if (asked.length === 0) {
    return new Map();
  }
  const { results } = await db
    .prepare(
      "SELECT players.id, players.name, ratings.rating, ratings.ranked_games AS rankedGames, " +
        "ratings.highest_rating AS highestRating FROM players LEFT JOIN ratings ON ratings.player_id = players.id " +
        `WHERE players.id IN (${asked.map(() => "?").join(", ")})`,
    )
    .bind(...asked)
    .all();
  return new Map(
    results.map((row) => {
      const player = rankedPlayerOf(row);
      return [player.playerId, player];
    }),
  );
}
