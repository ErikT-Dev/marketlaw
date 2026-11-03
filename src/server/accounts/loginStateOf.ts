import { LOGIN_TIMES } from "./LOGIN_TIMES";

export function loginStateOf(lastUsedMs: number, now: number): "expired" | "record_use" | "fresh" {
  if (now - lastUsedMs > LOGIN_TIMES.expireAfterMs) {
    return "expired";
  }
  return now - lastUsedMs > LOGIN_TIMES.recordUseAfterMs ? "record_use" : "fresh";
}
