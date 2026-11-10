import type { GameId } from "../../shared/GameId";
import type { GameRecordDatabase } from "./GameRecordDatabase";
import { gameRecordRowsOf } from "./gameRecordRowsOf";
import type { StoredGameRecord } from "./StoredGameRecord";

export async function saveGameRecord(
  db: GameRecordDatabase,
  id: GameId,
  record: StoredGameRecord,
): Promise<void> {
  await db.batch(
    gameRecordRowsOf(id, record).map(({ query, values }) => db.prepare(query).bind(...values)),
  );
}
