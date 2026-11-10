import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";

export function returnSiteEmail(record: LobbyRecord, now: EpochMs): LobbyRecord {
  const counts = countsOn(record, now);
  return { ...record, today: { ...counts, siteEmails: Math.max(0, counts.siteEmails - 1) } };
}
