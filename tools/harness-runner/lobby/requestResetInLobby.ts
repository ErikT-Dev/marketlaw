import { accountConfirmingEmail } from "./accountConfirmingEmail.ts";
import { lobbyEmailRejection } from "./lobbyEmailRejection.ts";
import type { LobbySession } from "./LobbySession.ts";

export function requestResetInLobby(
  session: LobbySession,
  step: Readonly<Record<string, unknown>>,
): void {
  if (step["human_check"] !== "passed") {
    session.rejected = "human_check_failed";
    return;
  }
  const account = accountConfirmingEmail(
    session,
    typeof step["email"] === "string" ? step["email"] : "",
  );
  const to = account?.registration?.email ?? null;
  if (account === null || to === null) {
    session.rejected = "email_not_confirmed";
    return;
  }
  const { playerId } = account.identity;
  session.rejected = lobbyEmailRejection(session, playerId, to);
  if (session.rejected === null) {
    session.emails.send(playerId, { to, kind: "reset" }, session.now);
  }
}
