import type { FailedLogins } from "./FailedLogins";

export type LoginAttemptAccount = {
  readonly failedLogins: FailedLogins;
};
