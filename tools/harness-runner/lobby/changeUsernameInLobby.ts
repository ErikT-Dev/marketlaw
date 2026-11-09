import { decideUsernameChange } from "../../../src/server/accounts/decideUsernameChange.ts";
import { nameKeyOf } from "../../../src/server/accounts/nameKeyOf.ts";
import type { LobbySession } from "./LobbySession.ts";

function isNameTaken(session: LobbySession, wanted: string): boolean {
  return [...session.accounts.keys()].some((taken) => nameKeyOf(taken) === nameKeyOf(wanted));
}

export async function changeUsernameInLobby(
  session: LobbySession,
  name: string,
  wantedName: string,
): Promise<void> {
  const account = session.accounts.get(name);
  if (account === undefined) {
    session.rejected = "invalid_token";
    return;
  }
  const change = { currentName: name, wantedName, changedMs: account.usernameChangedMs };
  const decision = await decideUsernameChange({ ...change, now: session.now }, (wanted) =>
    Promise.resolve(isNameTaken(session, wanted)),
  );
  if (decision.kind === "refused") {
    session.rejected = decision.reason;
    return;
  }
  if (decision.kind === "renamed") {
    session.accounts.delete(name);
    session.accounts.set(wantedName, {
      ...account,
      identity: { ...account.identity, name: wantedName },
      usernameChangedMs: session.now,
    });
  }
}
