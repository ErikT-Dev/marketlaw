import type { ReplayRecordDatabase } from "./ReplayRecordDatabase";
import { replayRecordCutoff } from "./replayRecordCutoff";

export async function removeOldReplayRecords(db: ReplayRecordDatabase, now: number): Promise<void> {
  await db
    .prepare("DELETE FROM replay_records WHERE ended_ms <= ?")
    .bind(replayRecordCutoff(now))
    .run();
}
