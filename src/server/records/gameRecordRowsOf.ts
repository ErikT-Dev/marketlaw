import type { GameId } from "../../shared/GameId";
import { RATING_RULES } from "../ratings/RATING_RULES";
import type { GameRecordRow } from "./GameRecordRow";
import type { RecordPlayer } from "./RecordPlayer";
import type { StoredGameRecord } from "./StoredGameRecord";

const INSERT_RECORD = "INSERT INTO game_records (id, ended_ms, record) VALUES (?, ?, ?)";
const INSERT_PLAYER =
  "INSERT INTO game_record_players (player_id, ended_ms, game_id) VALUES (?, ?, ?)";
const STARTING = String(RATING_RULES.startingRating);
const ADD_RATING_CHANGE =
  "INSERT INTO ratings (player_id, rating, ranked_games, highest_rating) " +
  `SELECT ?, ${STARTING} + ?, 1, MAX(${STARTING}, ${STARTING} + ?) ` +
  "WHERE EXISTS (SELECT 1 FROM players WHERE id = ?) " +
  "ON CONFLICT (player_id) DO UPDATE SET rating = rating + ?, " +
  "ranked_games = ranked_games + 1, highest_rating = MAX(highest_rating, rating + ?)";

function ratingRowsOf({ playerId, rating }: RecordPlayer): ReadonlyArray<GameRecordRow> {
  return rating === null
    ? []
    : [
        {
          query: ADD_RATING_CHANGE,
          values: [playerId, rating.change, rating.change, playerId, rating.change, rating.change],
        },
      ];
}

export function gameRecordRowsOf(
  id: GameId,
  record: StoredGameRecord,
): ReadonlyArray<GameRecordRow> {
  return [
    { query: INSERT_RECORD, values: [id, record.endedMs, JSON.stringify(record)] },
    ...record.players.map(({ playerId }) => ({
      query: INSERT_PLAYER,
      values: [playerId, record.endedMs, id],
    })),
    ...record.players.flatMap(ratingRowsOf),
  ];
}
