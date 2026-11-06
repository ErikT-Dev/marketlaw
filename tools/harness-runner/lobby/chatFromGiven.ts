import type { ChatMessage } from "../../../src/server/room/ChatMessage.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export function chatFromGiven(
  given: LobbyGiven,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): ReadonlyArray<ChatMessage> {
  return (given.room?.chat ?? []).map(({ from, text }) => ({
    from: identityNamed(from).playerId,
    name: from,
    text,
    at: now,
  }));
}
