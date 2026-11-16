import type { ChatQuotaGrant } from "../../../src/server/room/ChatQuotaGrant.ts";
import { grantChatQuota } from "../../../src/server/lobby/grantChatQuota.ts";
import { siteChatLimitOf } from "../../../src/server/lobby/siteChatLimitOf.ts";
import type { LobbySession } from "./LobbySession.ts";

export function grantChatQuotaInLobby(session: LobbySession): ChatQuotaGrant {
  const grant = grantChatQuota(session.lobby, {
    now: session.now,
    siteChatMessagesPerDay: siteChatLimitOf({}),
  });
  session.lobby = grant.record;
  return { kind: "granted", count: grant.granted };
}
