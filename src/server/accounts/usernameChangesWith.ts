import { changesWithUnder } from "./changesWithUnder";
import { USERNAME_CHANGE_LIMIT } from "./USERNAME_CHANGE_LIMIT";

export function usernameChangesWith(
  changesMs: ReadonlyArray<number>,
  now: number,
): ReadonlyArray<number> {
  return changesWithUnder(USERNAME_CHANGE_LIMIT, changesMs, now);
}
