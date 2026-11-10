import type { BusyDayAccountAction } from "./BusyDayAccountAction.ts";

export const BUSY_DAY_ACCOUNT_ACTIONS = {
  guestSignup: { perDay: 20, rowsWritten: 3 },
  signupWithoutLogin: { perDay: 10, rowsWritten: 5 },
  login: { perDay: 40, rowsWritten: 2 },
  loginAfterFailedLogins: { perDay: 10, rowsWritten: 3 },
  failedLogin: { perDay: 20, rowsWritten: 1 },
  failedLoginForUnknownAccount: { perDay: 20, rowsWritten: 2 },
  logout: { perDay: 20, rowsWritten: 2 },
  usernameChange: { perDay: 10, rowsWritten: 2 },
  signupEmail: { perDay: 30, rowsWritten: 4 },
  sendAgainEmail: { perDay: 10, rowsWritten: 5 },
  oldEmailCountDelete: { perDay: 60, rowsWritten: 1 },
  expiredEmailLinkDelete: { perDay: 30, rowsWritten: 2 },
} as const satisfies Readonly<Record<string, BusyDayAccountAction>>;
