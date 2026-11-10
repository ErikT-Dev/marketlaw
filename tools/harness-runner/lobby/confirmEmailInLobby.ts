import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbySession } from "./LobbySession.ts";
import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";

function isLinkLive(session: LobbySession, account: LobbyAccount): boolean {
  const { playerId } = account.identity;
  const serial = session.emails.newestSerial(playerId, "confirm");
  return (
    serial !== null && session.emails.useLink(playerId, { kind: "confirm", serial }, session.now)
  );
}

function removeFromOthers(session: LobbySession, confirmed: LobbyAccount, emailKey: string) {
  for (const account of session.accounts.values()) {
    const { registration } = account;
    const isSameAddress =
      registration?.email !== null &&
      registration?.email !== undefined &&
      emailKeyOf(registration.email) === emailKey;
    if (account !== confirmed && registration !== null && isSameAddress) {
      session.accounts.set(account.identity.name, {
        ...account,
        registration: { ...registration, email: null },
      });
    }
  }
}

export function confirmEmailInLobby(session: LobbySession, name: string): void {
  const account = session.accounts.get(name);
  const registration = account?.registration ?? null;
  const email = registration?.email ?? null;
  const isLive = account !== undefined && isLinkLive(session, account);
  if (
    !isLive ||
    registration === null ||
    email === null ||
    registration.isEmailConfirmed ||
    accountConfirmingEmail(session, email) !== null
  ) {
    session.rejected = "link_expired";
    return;
  }
  const confirmed = { ...account, registration: { ...registration, isEmailConfirmed: true } };
  session.accounts.set(name, confirmed);
  removeFromOthers(session, confirmed, emailKeyOf(email));
}
