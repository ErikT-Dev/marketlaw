import type { GameId } from "../../shared/GameId";
import type { GameRecordRow } from "./GameRecordRow";
import type { StoredGameRecord } from "./StoredGameRecord";

const INSERT_RECORD = "INSERT INTO game_records (id, ended_ms, record) VALUES (?, ?, ?)";
const INSERT_PLAYER =
  "INSERT INTO game_record_players (player_id, ended_ms, game_id) VALUES (?, ?, ?)";

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
  ];
}
