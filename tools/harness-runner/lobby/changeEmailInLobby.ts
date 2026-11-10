import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import { emailProblem } from "../../../src/server/accounts/emailProblem.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";
import { lobbyEmailRejection } from "./lobbyEmailRejection.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";
import type { LobbySession } from "./LobbySession.ts";

function isOwnConfirmedEmail(registration: LobbyRegistration, email: string): boolean {
  return (
    registration.isEmailConfirmed &&
    registration.email !== null &&
    emailKeyOf(registration.email) === emailKeyOf(email)
  );
}

function changeRejection(
  session: LobbySession,
  change: { readonly email: string; readonly playerId: PlayerId; readonly isNoChange: boolean },
  step: Readonly<Record<string, unknown>>,
): ReasonCode | null {
  return (
    emailProblem(change.email) ??
    (step["human_check"] === "passed" ? null : "human_check_failed") ??
    (change.isNoChange ? null : lobbyEmailRejection(session, change.playerId, change.email))
  );
}

export function changeEmailInLobby(
  session: LobbySession,
  name: string,
  step: Readonly<Record<string, unknown>>,
): void {
  const account = session.accounts.get(name);
  const registration = account?.registration ?? null;
  const email = typeof step["email"] === "string" ? step["email"] : "";
  if (account === undefined || registration === null) {
    session.rejected = account === undefined ? "invalid_token" : "not_registered";
    return;
  }
  const isNoChange = isOwnConfirmedEmail(registration, email);
  const { playerId } = account.identity;
  session.rejected = changeRejection(session, { email, playerId, isNoChange }, step);
  if (session.rejected !== null) {
    return;
  }
  session.accounts.set(name, {
    ...account,
    registration: { ...registration, pendingEmail: isNoChange ? null : email },
  });
  if (isNoChange) {
    return;
  }
  const kind =
    accountConfirmingEmail(session, email) === null ? "change_confirm" : "already_in_use";
  session.emails.send(playerId, { to: email, kind }, session.now);
}
