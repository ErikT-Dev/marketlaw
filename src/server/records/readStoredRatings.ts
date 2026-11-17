import type { PlayerId } from "../../shared/PlayerId";
import type { GameRecordDatabase } from "./GameRecordDatabase";
import type { PlayerRating } from "./PlayerRating";

const READ_RATING = "SELECT rating FROM ratings WHERE player_id = ?";

export async function readStoredRatings(
  db: GameRecordDatabase,
  playerIds: ReadonlyArray<PlayerId>,
): Promise<ReadonlyArray<PlayerRating>> {
  const ratings = await Promise.all(
    playerIds.map(async (playerId) => ({
      playerId,
      rating: await db.prepare(READ_RATING).bind(playerId).first("rating"),
    })),
  );
  return ratings.flatMap(({ playerId, rating }) =>
    typeof rating === "number" ? [{ playerId, rating }] : [],
  );
}
