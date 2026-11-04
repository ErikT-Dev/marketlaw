import type { RoomCode } from "../../shared/RoomCode";
import type { ReplayRecordDatabase } from "./ReplayRecordDatabase";
import { replayRecordCutoff } from "./replayRecordCutoff";

export async function keptReplayRecordText(
  db: ReplayRecordDatabase,
  code: RoomCode,
  now: number,
): Promise<string | null> {
  const record = await db
    .prepare(
      "SELECT record FROM replay_records WHERE room_code = ? AND ended_ms > ? ORDER BY ended_ms DESC LIMIT 1",
    )
    .bind(code, replayRecordCutoff(now))
    .first("record");
  return typeof record === "string" ? record : null;
}
