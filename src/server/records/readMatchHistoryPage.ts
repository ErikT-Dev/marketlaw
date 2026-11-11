import * as v from "valibot";
import { HistoryCursor } from "../../shared/api/HistoryCursor";
import { GameId } from "../../shared/GameId";
import type { PlayerId } from "../../shared/PlayerId";
import type { KeptGameRecord } from "./KeptGameRecord";
import { MATCH_HISTORY_PAGE_SIZE } from "./MATCH_HISTORY_PAGE_SIZE";
import type { MatchHistoryPage } from "./MatchHistoryPage";
import type { RecordReadDatabase } from "./RecordReadDatabase";
import { storedGameRecordOfText } from "./storedGameRecordOfText";

const HISTORY_QUERY = `SELECT game_record_players.game_id AS game_id, game_records.record AS record
FROM game_record_players JOIN game_records ON game_records.id = game_record_players.game_id
WHERE game_record_players.player_id = ?
AND (game_record_players.ended_ms < ? OR (game_record_players.ended_ms = ? AND game_record_players.game_id < ?))
ORDER BY game_record_players.ended_ms DESC, game_record_players.game_id DESC LIMIT ?`;

const HISTORY_ROW = v.object({ game_id: GameId, record: v.string() });

function olderThan(games: ReadonlyArray<KeptGameRecord>): HistoryCursor | null {
  const last = games[MATCH_HISTORY_PAGE_SIZE - 1];
  return games.length <= MATCH_HISTORY_PAGE_SIZE || last === undefined
    ? null
    : v.parse(HistoryCursor, { endedAt: last.record.endedMs, gameId: last.gameId });
}

export async function readMatchHistoryPage(
  db: RecordReadDatabase,
  playerId: PlayerId,
  before: HistoryCursor | null,
): Promise<MatchHistoryPage> {
  const endedBefore = before?.endedAt ?? Number.MAX_SAFE_INTEGER;
  const { results } = await db
    .prepare(HISTORY_QUERY)
    .bind(playerId, endedBefore, endedBefore, before?.gameId ?? "", MATCH_HISTORY_PAGE_SIZE + 1)
    .all();
  const games = results.map((row) => {
    const { game_id: gameId, record } = v.parse(HISTORY_ROW, row);
    return { gameId, record: storedGameRecordOfText(record) };
  });
  return { games: games.slice(0, MATCH_HISTORY_PAGE_SIZE), older: olderThan(games) };
}
