import { FAILED_LOGIN_LIMITS } from "./FAILED_LOGIN_LIMITS";
import type { FailedLogins } from "./FailedLogins";
import { isHumanCheckNeededToLogIn } from "./isHumanCheckNeededToLogIn";

export function failedLoginsAfter(failedLogins: FailedLogins, failedAtMs: number): FailedLogins {
  const recent = failedLogins.timesMs.filter(
    (timeMs) => failedAtMs - timeMs < FAILED_LOGIN_LIMITS.windowMs,
  );
  const timesMs = [...recent, failedAtMs].slice(-FAILED_LOGIN_LIMITS.attempts);
  const isCheckOn =
    isHumanCheckNeededToLogIn(failedLogins, failedAtMs) ||
    timesMs.length >= FAILED_LOGIN_LIMITS.attempts;
  return {
    timesMs,
    humanCheckUntilMs: isCheckOn ? failedAtMs + FAILED_LOGIN_LIMITS.windowMs : null,
  };
}
