import * as v from "valibot";
import type { RoomCode } from "../../shared/RoomCode";
import { migratedReplayRecord } from "./migratedReplayRecord";
import type { ReplayRecord } from "./ReplayRecord";
import type { ReplayRecordDatabase } from "./ReplayRecordDatabase";
import { replayRecordCutoff } from "./replayRecordCutoff";
import { STORED_REPLAY_SCHEMA } from "./STORED_REPLAY_SCHEMA";
import { parsedJsonOf } from "../room/parsedJsonOf";

export async function keptReplayRecord(
  db: ReplayRecordDatabase,
  code: RoomCode,
  now: number,
): Promise<ReplayRecord | null> {
  const text = await db
    .prepare(
      "SELECT record FROM replay_records WHERE room_code = ? AND ended_ms > ? ORDER BY ended_ms DESC LIMIT 1",
    )
    .bind(code, replayRecordCutoff(now))
    .first("record");
  const parsed = v.safeParse(
    STORED_REPLAY_SCHEMA,
    typeof text === "string" ? parsedJsonOf(text) : undefined,
  );
  return parsed.success ? migratedReplayRecord(parsed.output) : null;
}
