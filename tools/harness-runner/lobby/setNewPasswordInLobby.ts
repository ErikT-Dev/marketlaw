import { NO_FAILED_LOGINS } from "../../../src/server/accounts/NO_FAILED_LOGINS.ts";
import { passwordProblem } from "../../../src/server/accounts/passwordProblem.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbySession } from "./LobbySession.ts";

function accountOfLiveResetLink(session: LobbySession): LobbyAccount | null {
  const reset = session.emails.newestReset;
  if (reset === null) {
    return null;
  }
  const link = { kind: "reset", serial: reset.serial } as const;
  const account = [...session.accounts.values()].find(
    ({ identity }) => identity.playerId === reset.playerId,
  );
  return session.emails.useLink(reset.playerId, link, session.now) ? (account ?? null) : null;
}

function endEveryLogin(session: LobbySession, name: string): void {
  for (const [visitor, loggedInAs] of session.visitorLogins) {
    if (loggedInAs === name) {
      session.visitorLogins.delete(visitor);
    }
  }
  if (session.loggedIn?.["as"] === name) {
    session.loggedIn = null;
  }
}

export function setNewPasswordInLobby(
  session: LobbySession,
  visitor: string,
  step: Readonly<Record<string, unknown>>,
): void {
  const password = typeof step["password"] === "string" ? step["password"] : "";
  session.rejected = passwordProblem(password);
  if (session.rejected !== null) {
    return;
  }
  const account = accountOfLiveResetLink(session);
  const registration = account?.registration ?? null;
  if (account === null || registration === null) {
    session.rejected = "link_expired";
    return;
  }
  const { name } = account.identity;
  const failedLogins = NO_FAILED_LOGINS;
  session.accounts.set(name, {
    ...account,
    registration: { ...registration, password, failedLogins },
  });
  endEveryLogin(session, name);
  session.visitorLogins.set(visitor, name);
}
