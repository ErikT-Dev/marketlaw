import type { RoomRecord } from "../room/RoomRecord";
import { endedGameOf } from "./endedGameOf";
import type { ReplayRecordDatabase } from "./ReplayRecordDatabase";
import { saveReplayRecord } from "./saveReplayRecord";

export async function saveReplayRecordIfEnded(
  db: ReplayRecordDatabase,
  before: RoomRecord | null,
  after: RoomRecord,
): Promise<void> {
  const ended = endedGameOf(before, after);
  if (ended !== null) {
    await saveReplayRecord(db, after.code, ended).catch((error: unknown) => {
      console.error("Saving the replay record failed", after.code, error);
    });
  }
}
