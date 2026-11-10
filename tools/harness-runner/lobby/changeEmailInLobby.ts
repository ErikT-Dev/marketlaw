import { emailProblem } from "../../../src/server/accounts/emailProblem.ts";
import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";
import { lobbyEmailRejection } from "./lobbyEmailRejection.ts";
import type { LobbySession } from "./LobbySession.ts";

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
  session.rejected =
    emailProblem(email) ??
    (step["human_check"] === "passed" ? null : "human_check_failed") ??
    lobbyEmailRejection(session, account.identity.playerId, email);
  if (session.rejected !== null) {
    return;
  }
  session.accounts.set(name, {
    ...account,
    registration: { ...registration, pendingEmail: email },
  });
  const kind =
    accountConfirmingEmail(session, email) === null ? "change_confirm" : "already_in_use";
  session.emails.send(account.identity.playerId, { to: email, kind }, session.now);
}
