import type { FailedLogins } from "./FailedLogins";
import { failedLoginsAfter } from "./failedLoginsAfter";
import { isHumanCheckNeededToLogIn } from "./isHumanCheckNeededToLogIn";
import type { LoginAttemptAccount } from "./LoginAttemptAccount";
import type { LoginDecision } from "./LoginDecision";

export async function decideLogin<Account extends LoginAttemptAccount>(
  account: Account | null,
  attempt: {
    readonly now: number;
    readonly unknownAccountFailedLogins: FailedLogins;
    readonly isHuman: () => Promise<boolean>;
    readonly isPasswordRight: (account: Account | null) => Promise<boolean>;
  },
): Promise<LoginDecision<Account>> {
  const failedLogins = account?.failedLogins ?? attempt.unknownAccountFailedLogins;
  if (isHumanCheckNeededToLogIn(failedLogins, attempt.now) && !(await attempt.isHuman())) {
    return { kind: "human_check_failed" };
  }
  const isPasswordRight = await attempt.isPasswordRight(account);
  if (account === null) {
    return { kind: "unknown_account", failedLogins: failedLoginsAfter(failedLogins, attempt.now) };
  }
  return isPasswordRight
    ? { kind: "logged_in", account, hadFailedLogins: account.failedLogins.timesMs.length > 0 }
    : {
        kind: "wrong_password",
        account,
        failedLogins: failedLoginsAfter(account.failedLogins, attempt.now),
      };
}
