import * as v from "valibot";
import { gameRecordRowsOf } from "../../src/server/records/gameRecordRowsOf.ts";
import { storedGameRecordOf } from "../../src/server/records/storedGameRecordOf.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import { GameId } from "../../src/shared/GameId.ts";

const MEASURED_GAME_ID = v.parse(GameId, "00000000-0000-4000-8000-000000000000");

export function gameRecordRowCountOf(room: RoomRecord): number {
  const record = room.game === null ? null : storedGameRecordOf({ ...room.game, kind: "ranked" });
  return record === null ? 0 : gameRecordRowsOf(MEASURED_GAME_ID, record).length;
}
