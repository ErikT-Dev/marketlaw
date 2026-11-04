import type { ReplayRecordDatabase } from "./ReplayRecordDatabase";
import type { SavedGame } from "../../rules/SavedGame";
import type { RoomCode } from "../../shared/RoomCode";
import { replayRecordOf } from "./replayRecordOf";

export async function saveReplayRecord(
  db: ReplayRecordDatabase,
  code: RoomCode,
  saved: SavedGame,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO replay_records (room_code, ended_ms, record) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
    )
    .bind(code, saved.state.clockStartedAt, JSON.stringify(replayRecordOf(saved)))
    .run();
}
