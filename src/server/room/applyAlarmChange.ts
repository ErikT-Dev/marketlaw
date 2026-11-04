import type { AlarmChange } from "./AlarmChange";

export async function applyAlarmChange(
  storage: DurableObjectStorage,
  change: AlarmChange,
): Promise<void> {
  switch (change.kind) {
    case "keep":
      return;
    case "set":
      await storage.setAlarm(change.at);
      return;
    case "delete":
      await storage.deleteAlarm();
  }
}
