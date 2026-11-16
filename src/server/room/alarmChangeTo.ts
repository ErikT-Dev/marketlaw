import type { AlarmChange } from "./AlarmChange";

export function alarmChangeTo(current: number | null, wanted: number | null): AlarmChange {
  if (wanted === current) {
    return { kind: "keep" };
  }
  return wanted === null ? { kind: "delete" } : { kind: "set", at: wanted };
}
