import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbySession } from "./LobbySession.ts";

export function accountConfirmingEmail(session: LobbySession, email: string): LobbyAccount | null {
  return (
    [...session.accounts.values()].find(
      ({ registration }) =>
        registration?.isEmailConfirmed === true &&
        registration.email !== null &&
        emailKeyOf(registration.email) === emailKeyOf(email),
    ) ?? null
  );
}
