import { describe, expect, it } from "vitest";
import type { FailedLogins } from "./FailedLogins";
import { decideLogin } from "./decideLogin";
import { NO_FAILED_LOGINS } from "./NO_FAILED_LOGINS";

const CHECK_ON: FailedLogins = { timesMs: [0, 1, 2], humanCheckUntilMs: 1000 };

function attemptOf(
  isHuman: boolean,
  isPasswordRight: boolean,
  unknownAccountFailedLogins: FailedLogins = NO_FAILED_LOGINS,
) {
  const checked = { humanChecks: 0, passwords: 0 };
  const attempt = {
    now: 10,
    unknownAccountFailedLogins,
    isHuman: () => {
      checked.humanChecks += 1;
      return Promise.resolve(isHuman);
    },
    isPasswordRight: () => {
      checked.passwords += 1;
      return Promise.resolve(isPasswordRight);
    },
  };
  return { attempt, checked };
}

describe("decideLogin", () => {
  it("refuses without checking the password when the human check is needed and fails", async () => {
    const { attempt, checked } = attemptOf(false, true);
    const decision = await decideLogin({ failedLogins: CHECK_ON }, attempt);
    expect(decision.kind).toBe("human_check_failed");
    expect(checked).toEqual({ humanChecks: 1, passwords: 0 });
  });

  it("does not ask for the human check when it is not needed", async () => {
    const { attempt, checked } = attemptOf(false, true);
    const decision = await decideLogin({ failedLogins: NO_FAILED_LOGINS }, attempt);
    expect(decision.kind).toBe("logged_in");
    expect(checked).toEqual({ humanChecks: 0, passwords: 1 });
  });

  it("checks a password once for an unknown account and fails it", async () => {
    const { attempt, checked } = attemptOf(false, true);
    const decision = await decideLogin(null, attempt);
    expect(decision).toEqual({
      kind: "unknown_account",
      failedLogins: { timesMs: [10], humanCheckUntilMs: null },
    });
    expect(checked).toEqual({ humanChecks: 0, passwords: 1 });
  });

  it("asks for the human check for an unknown account after its failed logins", async () => {
    const { attempt, checked } = attemptOf(false, false, CHECK_ON);
    const decision = await decideLogin(null, attempt);
    expect(decision.kind).toBe("human_check_failed");
    expect(checked).toEqual({ humanChecks: 1, passwords: 0 });
  });

  it("uses the account's failed logins, not the unknown name's, when the account exists", async () => {
    const { attempt, checked } = attemptOf(false, true, CHECK_ON);
    const decision = await decideLogin({ failedLogins: NO_FAILED_LOGINS }, attempt);
    expect(decision.kind).toBe("logged_in");
    expect(checked).toEqual({ humanChecks: 0, passwords: 1 });
  });

  it("records the failure of a wrong password", async () => {
    const { attempt } = attemptOf(true, false);
    const decision = await decideLogin({ failedLogins: NO_FAILED_LOGINS }, attempt);
    expect(decision).toEqual({
      kind: "wrong_password",
      account: { failedLogins: NO_FAILED_LOGINS },
      failedLogins: { timesMs: [10], humanCheckUntilMs: null },
    });
  });

  it("logs in after a passed human check and says that failures are to be cleared", async () => {
    const { attempt } = attemptOf(true, true);
    const decision = await decideLogin({ failedLogins: CHECK_ON }, attempt);
    expect(decision).toEqual({
      kind: "logged_in",
      account: { failedLogins: CHECK_ON },
      hadFailedLogins: true,
    });
  });
});
