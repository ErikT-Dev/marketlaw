import * as v from "valibot";
import { saveGameRecord } from "../../../src/server/records/saveGameRecord.ts";
import { storedGameRecordOf } from "../../../src/server/records/storedGameRecordOf.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { GameId } from "../../../src/shared/GameId.ts";
import { memoryGameRecordDatabase } from "./memoryGameRecordDatabase.ts";

export async function gameRecordThen(endedRoom: RoomRecord | null): Promise<string> {
  const game = endedRoom?.game ?? null;
  const record = game === null ? null : storedGameRecordOf(game);
  if (game === null || record === null) {
    return "no ended game";
  }
  const { database, rowCounts } = memoryGameRecordDatabase();
  await saveGameRecord(database, v.parse(GameId, crypto.randomUUID()), record);
  const { records, players } = rowCounts();
  return records === 1 && players === game.seats.length
    ? "kept"
    : `${String(records)} records and ${String(players)} player rows stored`;
}
