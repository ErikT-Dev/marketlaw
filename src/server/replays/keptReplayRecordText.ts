import type { RoomCode } from "../../shared/RoomCode";
import { replayRecordCutoff } from "./replayRecordCutoff";

export async function keptReplayRecordText(
  db: D1Database,
  code: RoomCode,
  now: number,
): Promise<string | null> {
  return db
    .prepare(
      "SELECT record FROM replay_records WHERE room_code = ? AND ended_ms > ? ORDER BY ended_ms DESC LIMIT 1",
    )
    .bind(code, replayRecordCutoff(now))
    .first<string>("record");
}
