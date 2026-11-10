import type { EpochMs } from "../../shared/EpochMs";
import { dayOf } from "../lobby/dayOf";

export async function removeOldEmailRecords(db: D1Database, now: EpochMs): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM email_counts WHERE day < ?").bind(dayOf(now) - 1),
    db.prepare("DELETE FROM email_links WHERE expires_ms <= ?").bind(now),
  ]);
}
