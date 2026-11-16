import { recentUsernameChangesOf } from "./recentUsernameChangesOf";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";
import { USERNAME_CHANGES_IN_WAIT } from "./USERNAME_CHANGES_IN_WAIT";

export function usernameChangeAllowedAt(
  changesMs: ReadonlyArray<number>,
  now: number,
): number | null {
  const recent = recentUsernameChangesOf(changesMs, now);
  return recent.length < USERNAME_CHANGES_IN_WAIT
    ? null
    : Math.min(...recent.slice(-USERNAME_CHANGES_IN_WAIT)) + USERNAME_CHANGE_WAIT_MS;
}
