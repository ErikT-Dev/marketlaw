import type { AlarmChange } from "./AlarmChange";
import { alarmChangeTo } from "./alarmChangeTo";
import { nextAlarmAt } from "./nextAlarmAt";
import type { RoomRecord } from "./RoomRecord";

export function alarmChangeFor(current: number | null, record: RoomRecord | null): AlarmChange {
  return alarmChangeTo(current, nextAlarmAt(record));
}
