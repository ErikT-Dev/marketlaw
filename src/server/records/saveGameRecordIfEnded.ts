import * as v from "valibot";
import { GameId } from "../../shared/GameId";
import { endedGameOf } from "../replays/endedGameOf";
import type { RoomRecord } from "../room/RoomRecord";
import type { GameRecordDatabase } from "./GameRecordDatabase";
import type { PlayerRating } from "./PlayerRating";
import { readStoredRatings } from "./readStoredRatings";
import { saveGameRecord } from "./saveGameRecord";
import type { StoredGameRecord } from "./StoredGameRecord";
import { storedGameRecordOf } from "./storedGameRecordOf";

async function saveAndReadRatings(
  db: GameRecordDatabase,
  record: StoredGameRecord,
): Promise<ReadonlyArray<PlayerRating>> {
  await saveGameRecord(db, v.parse(GameId, crypto.randomUUID()), record);
  return readStoredRatings(
    db,
    record.players.flatMap(({ playerId, rating }) => (rating === null ? [] : [playerId])),
  );
}

export async function saveGameRecordIfEnded(
  db: GameRecordDatabase,
  before: RoomRecord | null,
  after: RoomRecord,
): Promise<ReadonlyArray<PlayerRating>> {
  const { game } = after;
  const record =
    endedGameOf(before, after) === null || game === null ? null : storedGameRecordOf(game);
  if (record === null) {
    return [];
  }
  return saveAndReadRatings(db, record).catch((error: unknown) => {
    console.error("Saving the game record failed", after.code, error);
    return [];
  });
}
