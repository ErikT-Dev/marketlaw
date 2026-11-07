import type { EpochMs } from "../../../shared/EpochMs";

export function chatTimeText(at: EpochMs): string {
  const localTime = new Date(at);
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
