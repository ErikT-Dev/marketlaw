import type { ReasonCode } from "../../shared/ReasonCode";
import { usernameProblem } from "./usernameProblem";

export function guestNameDecision(
  name: string,
  checks: {
    readonly isTaken: boolean;
    readonly isHuman: boolean;
  },
): ReasonCode | null {
  const problem = usernameProblem(name);
  if (problem !== null) {
    return problem;
  }
  if (checks.isTaken) {
    return "username_taken";
  }
  return checks.isHuman ? null : "human_check_failed";
}
