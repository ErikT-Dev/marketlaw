import { changeAllowedAtUnder } from "./changeAllowedAtUnder";
import { USERNAME_CHANGE_LIMIT } from "./USERNAME_CHANGE_LIMIT";

export function usernameChangeAllowedAt(
  changesMs: ReadonlyArray<number>,
  now: number,
): number | null {
  return changeAllowedAtUnder(USERNAME_CHANGE_LIMIT, changesMs, now);
}
