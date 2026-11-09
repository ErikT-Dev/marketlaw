import type { FailedLogins } from "./FailedLogins";
import type { LoginAttemptAccount } from "./LoginAttemptAccount";

export type LoginDecision<Account extends LoginAttemptAccount> =
  | { readonly kind: "human_check_failed" }
  | { readonly kind: "unknown_account" }
  | {
      readonly kind: "wrong_password";
      readonly account: Account;
      readonly failedLogins: FailedLogins;
    }
  | { readonly kind: "logged_in"; readonly account: Account; readonly hadFailedLogins: boolean };
