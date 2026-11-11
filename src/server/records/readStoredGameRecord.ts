import * as v from "valibot";
import type { GameId } from "../../shared/GameId";
import type { RecordReadDatabase } from "./RecordReadDatabase";
import type { StoredGameRecord } from "./StoredGameRecord";
import { storedGameRecordOfText } from "./storedGameRecordOfText";

const RECORD_ROW = v.object({ record: v.string() });

export async function readStoredGameRecord(
  db: RecordReadDatabase,
  gameId: GameId,
): Promise<StoredGameRecord | null> {
  const { results } = await db
    .prepare("SELECT record FROM game_records WHERE id = ?")
    .bind(gameId)
    .all();
  const [row] = results;
  return row === undefined ? null : storedGameRecordOfText(v.parse(RECORD_ROW, row).record);
}
