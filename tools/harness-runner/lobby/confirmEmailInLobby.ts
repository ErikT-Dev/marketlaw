import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { LobbySession } from "./LobbySession.ts";
import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";

function newestLinkKind(session: LobbySession, account: LobbyAccount) {
  const { playerId } = account.identity;
  const confirm = session.emails.newestSerial(playerId, "confirm") ?? 0;
  const change = session.emails.newestSerial(playerId, "change_confirm") ?? 0;
  return change > confirm
    ? { kind: "change_confirm" as const, serial: change }
    : { kind: "confirm" as const, serial: confirm };
}

function isSameAddress(email: string | null, emailKey: string): boolean {
  return email !== null && emailKeyOf(email) === emailKey;
}

function withoutAddress(registration: LobbyRegistration, emailKey: string): LobbyRegistration {
  return {
    ...registration,
    email: isSameAddress(registration.email, emailKey) ? null : registration.email,
    pendingEmail: isSameAddress(registration.pendingEmail, emailKey)
      ? null
      : registration.pendingEmail,
  };
}

function removeFromOthers(session: LobbySession, confirmed: LobbyAccount, emailKey: string) {
  for (const account of session.accounts.values()) {
    const { registration } = account;
    if (account !== confirmed && registration !== null && !registration.isEmailConfirmed) {
      session.accounts.set(account.identity.name, {
        ...account,
        registration: withoutAddress(registration, emailKey),
      });
    }
  }
}

function confirmedRegistration(
  registration: LobbyRegistration,
  kind: "confirm" | "change_confirm",
): LobbyRegistration | null {
  if (kind === "change_confirm") {
    return registration.pendingEmail === null
      ? null
      : { ...registration, email: registration.pendingEmail, pendingEmail: null };
  }
  return registration.email === null || registration.isEmailConfirmed ? null : registration;
}

function confirmedByLink(session: LobbySession, account: LobbyAccount) {
  const link = newestLinkKind(session, account);
  const isLive = session.emails.useLink(account.identity.playerId, link, session.now);
  const registration =
    account.registration === null ? null : confirmedRegistration(account.registration, link.kind);
  const email = registration?.email ?? null;
  if (!isLive || registration === null || email === null) {
    return null;
  }
  const confirming = accountConfirmingEmail(session, email);
  return confirming === null || confirming === account ? { registration, email } : null;
}

export function confirmEmailInLobby(session: LobbySession, name: string): void {
  const account = session.accounts.get(name);
  const confirmedBy = account === undefined ? null : confirmedByLink(session, account);
  if (account === undefined || confirmedBy === null) {
    session.rejected = "link_expired";
    return;
  }
  const registration = { ...confirmedBy.registration, isEmailConfirmed: true };
  const confirmed = { ...account, registration };
  session.accounts.set(name, confirmed);
  removeFromOthers(session, confirmed, emailKeyOf(confirmedBy.email));
}
