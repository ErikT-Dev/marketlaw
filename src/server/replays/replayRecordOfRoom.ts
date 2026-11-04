import type { RoomRecord } from "../room/RoomRecord";
import type { ReplayRecord } from "./ReplayRecord";
import { replayRecordOf } from "./replayRecordOf";

export function replayRecordOfRoom(record: RoomRecord | null): ReplayRecord | null {
  const saved = record?.game?.saved;
  return saved === undefined ? null : replayRecordOf(saved);
}
