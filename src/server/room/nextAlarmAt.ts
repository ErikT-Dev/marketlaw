import { earliestDeadline } from "../../rules/earliestDeadline";
import { nextWaitingDeadline } from "./nextWaitingDeadline";
import type { RoomRecord } from "./RoomRecord";

export function nextAlarmAt(record: RoomRecord | null): number | null {
  if (record === null) {
    return null;
  }
  return record.game === null
    ? nextWaitingDeadline(record)
    : earliestDeadline(record.game.saved.state);
}
