import { saveReplayRecordIfEnded } from "../replays/saveReplayRecordIfEnded";
import type { RoomRecord } from "../room/RoomRecord";
import { saveGameRecordIfEnded } from "./saveGameRecordIfEnded";

export async function saveRecordsIfEnded(
  db: D1Database,
  before: RoomRecord | null,
  after: RoomRecord,
): Promise<void> {
  await saveReplayRecordIfEnded(db, before, after);
  await saveGameRecordIfEnded(db, before, after);
}
