import type { FailedLogins } from "./FailedLogins";

export function isHumanCheckNeededToLogIn(failedLogins: FailedLogins, now: number): boolean {
  return failedLogins.humanCheckUntilMs !== null && now < failedLogins.humanCheckUntilMs;
}
