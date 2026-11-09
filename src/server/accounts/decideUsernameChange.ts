import { nameKeyOf } from "./nameKeyOf";
import type { UsernameChange } from "./UsernameChange";
import type { UsernameChangeDecision } from "./UsernameChangeDecision";
import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";
import { usernameProblem } from "./usernameProblem";

export async function decideUsernameChange(
  change: UsernameChange,
  isTaken: (name: string) => Promise<boolean>,
): Promise<UsernameChangeDecision> {
  const { currentName, wantedName, changedMs, now } = change;
  if (wantedName === currentName) {
    return { kind: "unchanged" };
  }
  const nameProblem = usernameProblem(wantedName);
  if (nameProblem !== null) {
    return { kind: "refused", reason: nameProblem };
  }
  if (changedMs !== null && now < changedMs + USERNAME_CHANGE_WAIT_MS) {
    return { kind: "refused", reason: "username_change_too_soon" };
  }
  const isOwnName = nameKeyOf(wantedName) === nameKeyOf(currentName);
  if (!isOwnName && (await isTaken(wantedName))) {
    return { kind: "refused", reason: "username_taken" };
  }
  return { kind: "renamed" };
}
