import { describe, expect, it } from "vitest";
import type { FailedLogins } from "./FailedLogins";
import { failedLoginsAfter } from "./failedLoginsAfter";
import { isHumanCheckNeededToLogIn } from "./isHumanCheckNeededToLogIn";
import { NO_FAILED_LOGINS } from "./NO_FAILED_LOGINS";

const MINUTE_MS = 60_000;

function failuresAt(minutes: ReadonlyArray<number>): FailedLogins {
  return minutes.reduce(
    (failedLogins, minute) => failedLoginsAfter(failedLogins, minute * MINUTE_MS),
    NO_FAILED_LOGINS,
  );
}

describe("failedLoginsAfter", () => {
  it("asks for the human check after 3 failures within 15 minutes", () => {
    expect(isHumanCheckNeededToLogIn(failuresAt([0, 1]), 2 * MINUTE_MS)).toBe(false);
    expect(isHumanCheckNeededToLogIn(failuresAt([0, 1, 2]), 2 * MINUTE_MS)).toBe(true);
  });

  it("ends the human check 15 minutes after the latest failure", () => {
    const failedLogins = failuresAt([0, 1, 2]);
    expect(isHumanCheckNeededToLogIn(failedLogins, 17 * MINUTE_MS - 1)).toBe(true);
    expect(isHumanCheckNeededToLogIn(failedLogins, 17 * MINUTE_MS)).toBe(false);
  });

  it("does not ask for the human check when 3 failures are spread over 15 minutes or more", () => {
    expect(isHumanCheckNeededToLogIn(failuresAt([0, 8, 15]), 15 * MINUTE_MS)).toBe(false);
    expect(isHumanCheckNeededToLogIn(failuresAt([0, 14, 28]), 28 * MINUTE_MS)).toBe(false);
  });

  it("keeps the human check on with every further failure while it is on", () => {
    const failedLogins = failuresAt([0, 1, 2, 16, 30]);
    expect(isHumanCheckNeededToLogIn(failedLogins, 44 * MINUTE_MS)).toBe(true);
    expect(isHumanCheckNeededToLogIn(failedLogins, 45 * MINUTE_MS)).toBe(false);
  });

  it("keeps at most the last 3 failures that lie within 15 minutes of the latest", () => {
    expect(failuresAt([0, 1, 2, 3]).timesMs).toEqual([1, 2, 3].map((minute) => minute * MINUTE_MS));
    expect(failuresAt([0, 1, 20]).timesMs).toEqual([20 * MINUTE_MS]);
  });

  it("starts counting again once the human check has ended", () => {
    const failedLogins = failuresAt([0, 1, 2, 40]);
    expect(failedLogins.humanCheckUntilMs).toBeNull();
    expect(isHumanCheckNeededToLogIn(failedLogins, 40 * MINUTE_MS)).toBe(false);
  });
});
