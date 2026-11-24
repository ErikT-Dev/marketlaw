import { randomUUID } from "node:crypto";
import * as v from "valibot";
import { iconOfOlderAccount } from "../../../src/server/accounts/iconOfOlderAccount.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { AccountChanges } from "./AccountChanges.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";
import type { LobbyRegistration } from "./LobbyRegistration.ts";

export function newLobbyAccount(
  name: string,
  lastUsedMs: number,
  registration: LobbyRegistration | null,
  changes: AccountChanges,
): LobbyAccount {
  const playerId = v.parse(PlayerId, randomUUID());
  const { usernameChangesMs, iconChangesMs } = changes;
  return {
    identity: { playerId, name, icon: changes.icon ?? iconOfOlderAccount(playerId) },
    lastUsedMs,
    registration,
    usernameChangesMs,
    iconChangesMs,
  };
}
