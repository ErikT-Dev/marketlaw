import type { LobbySession } from "./LobbySession.ts";
import { logOutPlayer } from "./logOutPlayer.ts";

export function deleteAccountInLobby(
  session: LobbySession,
  name: string,
  step: Readonly<Record<string, unknown>>,
): void {
  const account = session.accounts.get(name);
  const registration = account?.registration ?? null;
  if (account === undefined || registration === null) {
    session.rejected = account === undefined ? "invalid_token" : "not_registered";
    return;
  }
  const password = typeof step["password"] === "string" ? step["password"] : registration.password;
  if (password !== registration.password) {
    session.rejected = "password_wrong";
    return;
  }
  logOutPlayer(session, name, true);
  session.emails.removeLinksOf(account.identity.playerId);
  session.accounts.delete(name);
  for (const [visitor, loggedInAs] of session.visitorLogins) {
    if (loggedInAs === name) {
      session.visitorLogins.delete(visitor);
    }
  }
}
