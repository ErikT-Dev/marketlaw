import { replayRecordCutoff } from "./replayRecordCutoff";

export async function removeOldReplayRecords(db: D1Database, now: number): Promise<void> {
  await db
    .prepare("DELETE FROM replay_records WHERE ended_ms <= ?")
    .bind(replayRecordCutoff(now))
    .run();
}
