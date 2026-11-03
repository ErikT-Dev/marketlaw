import type { EpochMs } from "../../shared/EpochMs";
import { endedRoomDeletionAt } from "./endedRoomDeletionAt";
import type { RoomRecord } from "./RoomRecord";

export function isEndedRoomDue(record: RoomRecord, now: EpochMs): boolean {
  const deletionAt = endedRoomDeletionAt(record);
  return deletionAt !== null && deletionAt <= now;
}
