import { NO_FAILED_LOGINS } from "../../../src/server/accounts/NO_FAILED_LOGINS.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";

type GivenAccount = NonNullable<LobbyGiven["accounts"]>[number];

export function registrationFromGiven(
  account: GivenAccount,
  now: number,
): LobbyRegistration | null {
  return account.kind === "registered"
    ? {
        password: account.password ?? null,
        email: account.email ?? null,
        isEmailConfirmed: account.email_confirmed ?? false,
        pendingEmail: null,
        emailEnteredMs: now,
        failedLogins: NO_FAILED_LOGINS,
      }
    : null;
}
