import { earliestDeadline } from "../../rules/earliestDeadline";
import { endedRoomDeletionAt } from "./endedRoomDeletionAt";
import { nextWaitingDeadline } from "./nextWaitingDeadline";
import type { RoomRecord } from "./RoomRecord";

export function nextAlarmAt(record: RoomRecord | null): number | null {
  if (record === null) {
    return null;
  }
  if (record.game === null) {
    return nextWaitingDeadline(record);
  }
  const deletionAt = endedRoomDeletionAt(record);
  if (deletionAt === null) {
    return earliestDeadline(record.game.saved.state);
  }
  return Math.min(deletionAt, record.waiting.asking?.deadline ?? deletionAt);
}
