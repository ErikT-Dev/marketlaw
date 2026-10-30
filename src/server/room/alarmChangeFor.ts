import type { AlarmChange } from "./AlarmChange";
import { nextAlarmAt } from "./nextAlarmAt";
import type { RoomRecord } from "./RoomRecord";

export function alarmChangeFor(current: number | null, record: RoomRecord | null): AlarmChange {
  const wanted = nextAlarmAt(record);
  if (wanted === current) {
    return { kind: "keep" };
  }
  return wanted === null ? { kind: "delete" } : { kind: "set", at: wanted };
}
