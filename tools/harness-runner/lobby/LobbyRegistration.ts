import type { FailedLogins } from "../../../src/server/accounts/FailedLogins.ts";

export type LobbyRegistration = {
  readonly password: string | null;
  readonly email: string | null;
  readonly isEmailConfirmed: boolean;
  readonly emailEnteredMs: number;
  readonly failedLogins: FailedLogins;
};
