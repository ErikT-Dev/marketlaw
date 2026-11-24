import * as v from "valibot";
import { changesWithUnder } from "../../../src/server/accounts/changesWithUnder.ts";
import { decideIconChange } from "../../../src/server/accounts/decideIconChange.ts";
import { ICON_CHANGE_LIMIT } from "../../../src/server/accounts/ICON_CHANGE_LIMIT.ts";
import { IconChangeRequest } from "../../../src/shared/api/IconChangeRequest.ts";
import type { LobbySession } from "./LobbySession.ts";

const WANTED_ICON = IconChangeRequest.entries.icon;

export function changeIconInLobby(session: LobbySession, name: string, icon: unknown): void {
  const account = session.accounts.get(name);
  const wanted = v.safeParse(WANTED_ICON, icon);
  if (account === undefined || !wanted.success) {
    session.rejected = account === undefined ? "invalid_token" : "malformed_message";
    return;
  }
  const decision = decideIconChange({
    current: account.identity.icon,
    wanted: wanted.output,
    changesMs: account.iconChangesMs,
    now: session.now,
  });
  if (decision.kind === "refused") {
    session.rejected = decision.reason;
    return;
  }
  if (decision.kind === "changed") {
    session.accounts.set(name, {
      ...account,
      identity: { ...account.identity, icon: decision.icon },
      iconChangesMs: changesWithUnder(ICON_CHANGE_LIMIT, account.iconChangesMs, session.now),
    });
  }
}
