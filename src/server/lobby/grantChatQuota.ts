import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";

const CHAT_QUOTA_BLOCK = 20;

export function grantChatQuota(
  record: LobbyRecord,
  limits: { readonly now: EpochMs; readonly siteChatMessagesPerDay: number },
): { readonly record: LobbyRecord; readonly granted: number } {
  const counts = countsOn(record, limits.now);
  const granted = Math.min(
    CHAT_QUOTA_BLOCK,
    limits.siteChatMessagesPerDay - counts.siteChatMessages,
  );
  if (granted <= 0) {
    return { record, granted: 0 };
  }
  return {
    record: {
      ...record,
      today: { ...counts, siteChatMessages: counts.siteChatMessages + granted },
    },
    granted,
  };
}
