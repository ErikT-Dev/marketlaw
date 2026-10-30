import { earliestDeadline } from "../../rules/earliestDeadline";
import type { RoomRecord } from "./RoomRecord";

export function nextAlarmAt(record: RoomRecord | null): number | null {
  return record?.game === null || record === null
    ? null
    : earliestDeadline(record.game.saved.state);
}
