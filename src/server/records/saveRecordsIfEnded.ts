import { saveReplayRecordIfEnded } from "../replays/saveReplayRecordIfEnded";
import type { RoomRecord } from "../room/RoomRecord";
import type { PlayerRating } from "./PlayerRating";
import { saveGameRecordIfEnded } from "./saveGameRecordIfEnded";

export async function saveRecordsIfEnded(
  db: D1Database,
  before: RoomRecord | null,
  after: RoomRecord,
): Promise<ReadonlyArray<PlayerRating>> {
  await saveReplayRecordIfEnded(db, before, after);
  return saveGameRecordIfEnded(db, before, after);
}
