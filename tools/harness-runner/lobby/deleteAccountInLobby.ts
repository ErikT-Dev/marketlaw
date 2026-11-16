import { leaveQueue } from "../../../src/server/queue/leaveQueue.ts";
import { applyQueueChange } from "./applyQueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";
import { logOutPlayer } from "./logOutPlayer.ts";
import { queueContextIn } from "./queueContextIn.ts";

function leaveQueueOnDeletion(session: LobbySession, name: string): void {
  const state = { queue: session.queue, lobby: session.lobby };
  const left = leaveQueue(state, session.identityNamed(name).playerId, queueContextIn(session));
  if (left.isOk) {
    applyQueueChange(session, left.value);
  }
}

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
  leaveQueueOnDeletion(session, name);
  logOutPlayer(session, name, true);
  session.emails.removeLinksOf(account.identity.playerId);
  session.accounts.delete(name);
  for (const [visitor, loggedInAs] of session.visitorLogins) {
    if (loggedInAs === name) {
      session.visitorLogins.delete(visitor);
    }
  }
}
