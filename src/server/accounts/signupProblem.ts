import type { ReasonCode } from "../../shared/ReasonCode";
import { emailProblem } from "./emailProblem";
import { passwordProblem } from "./passwordProblem";
import type { SignupFields } from "./SignupFields";
import { usernameProblem } from "./usernameProblem";

export async function signupProblem(
  signup: SignupFields,
  checks: {
    readonly isHuman: () => Promise<boolean>;
    readonly isTaken: (name: string) => Promise<boolean>;
  },
): Promise<ReasonCode | null> {
  if (!(await checks.isHuman())) {
    return "human_check_failed";
  }
  const nameProblem = usernameProblem(signup.name);
  if (nameProblem !== null) {
    return nameProblem;
  }
  if (await checks.isTaken(signup.name)) {
    return "username_taken";
  }
  return emailProblem(signup.email) ?? passwordProblem(signup.password);
}
