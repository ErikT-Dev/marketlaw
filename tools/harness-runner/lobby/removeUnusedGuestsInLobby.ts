import { loginStateOf } from "../../../src/server/accounts/loginStateOf.ts";
import type { LobbySession } from "./LobbySession.ts";

export function removeUnusedGuestsInLobby(session: LobbySession): void {
  const unused = [...session.accounts]
    .filter(
      ([, account]) =>
        account.registration === null &&
        loginStateOf(account.lastUsedMs, session.now) === "expired",
    )
    .map(([name]) => name);
  for (const name of unused) {
    session.accounts.delete(name);
  }
  for (const [visitor, loggedInAs] of session.visitorLogins) {
    if (unused.includes(loggedInAs)) {
      session.visitorLogins.delete(visitor);
    }
  }
}
