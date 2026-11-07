import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";

const SITE_CHAT_MESSAGES_PER_DAY = 2000;
const CHAT_QUOTA_BLOCK = 20;

export function grantChatQuota(
  record: LobbyRecord,
  now: EpochMs,
): { readonly record: LobbyRecord; readonly granted: number } {
  const counts = countsOn(record, now);
  const granted = Math.min(CHAT_QUOTA_BLOCK, SITE_CHAT_MESSAGES_PER_DAY - counts.siteChatMessages);
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
