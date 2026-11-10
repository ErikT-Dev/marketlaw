import type { EpochMs } from "../../shared/EpochMs";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";

export function takeSiteEmail(
  record: LobbyRecord,
  limits: { readonly now: EpochMs; readonly siteEmailsPerDay: number },
): { readonly record: LobbyRecord; readonly isTaken: boolean } {
  const counts = countsOn(record, limits.now);
  if (counts.siteEmails >= limits.siteEmailsPerDay) {
    return { record, isTaken: false };
  }
  return {
    record: { ...record, today: { ...counts, siteEmails: counts.siteEmails + 1 } },
    isTaken: true,
  };
}
