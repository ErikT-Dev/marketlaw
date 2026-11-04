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
  return endedRoomDeletionAt(record) ?? earliestDeadline(record.game.saved.state);
}
