import { grantChatQuota } from "../../../src/server/lobby/grantChatQuota.ts";
import { siteChatLimitOf } from "../../../src/server/lobby/siteChatLimitOf.ts";
import type { ChatContext } from "../../../src/server/room/ChatContext.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { BusyDayCounter } from "./BusyDayCounter.ts";

const LOBBY_READS_PER_QUOTA_GRANT = 1;

export function busyDayChatContext(counter: BusyDayCounter, now: EpochMs): ChatContext {
  const chat = counter.chatBlocks.storage;
  return {
    messages: chat.messages(),
    quota: chat.quota(),
    grantQuota: () => {
      counter.countReads(LOBBY_READS_PER_QUOTA_GRANT);
      const grant = grantChatQuota(counter.lobby, {
        now,
        siteChatMessagesPerDay: siteChatLimitOf({}),
      });
      counter.changeLobby(grant.record);
      return { kind: "granted", count: grant.granted };
    },
  };
}
