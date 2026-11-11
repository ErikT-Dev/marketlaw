import { recentUsernameChangesOf } from "./recentUsernameChangesOf";
import { USERNAME_CHANGES_IN_WAIT } from "./USERNAME_CHANGES_IN_WAIT";

export function usernameChangesWith(
  changesMs: ReadonlyArray<number>,
  now: number,
): ReadonlyArray<number> {
  const kept = recentUsernameChangesOf(changesMs, now).slice(-(USERNAME_CHANGES_IN_WAIT - 1));
  return [...kept, now];
}
