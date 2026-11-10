import type { EpochMs } from "../../shared/EpochMs";
import type { CountsToday } from "./CountsToday";
import { dayOf } from "./dayOf";
import type { LobbyRecord } from "./LobbyRecord";

export function countsOn(record: LobbyRecord, now: EpochMs): CountsToday {
  const day = dayOf(now);
  return record.today.day === day
    ? record.today
    : { day, players: [], siteGameStarts: 0, siteChatMessages: 0, siteEmails: 0 };
}
