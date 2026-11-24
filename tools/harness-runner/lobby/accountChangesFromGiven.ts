import type { AccountChanges } from "./AccountChanges.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

type GivenAccount = NonNullable<LobbyGiven["accounts"]>[number];

export function accountChangesFromGiven(account: GivenAccount): AccountChanges {
  return {
    usernameChangesMs: account.username_changes_ms ?? [],
    iconChangesMs: account.icon_changes_ms ?? [],
    icon: account.icon ?? null,
  };
}
