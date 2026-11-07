import type { EpochMs } from "../../shared/EpochMs";
import type { RoomRecord } from "./RoomRecord";

export function withRematchTimedOut(record: RoomRecord, now: EpochMs): RoomRecord {
  const { asking } = record.waiting;
  if (asking === null || asking.deadline > now) {
    return record;
  }
  return { ...record, waiting: { ...record.waiting, asking: null } };
}
