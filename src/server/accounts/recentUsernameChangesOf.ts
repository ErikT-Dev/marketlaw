import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";

export function recentUsernameChangesOf(
  changesMs: ReadonlyArray<number>,
  now: number,
): ReadonlyArray<number> {
  return changesMs.filter((changedMs) => changedMs > now - USERNAME_CHANGE_WAIT_MS);
}
