import type { EpochMs } from "../../shared/EpochMs";
import { dayOf } from "../lobby/dayOf";
import { EMAILS_PER_DAY_LIMIT } from "./EMAILS_PER_DAY_LIMIT";
import { returnEmailCounts } from "./returnEmailCounts";

const TAKE_EMAIL =
  "INSERT INTO email_counts (counted_key, day, emails) VALUES (?1, ?2, 1) ON CONFLICT (counted_key, day) DO UPDATE SET emails = emails + 1 WHERE emails < ?3";

export async function takeEmailCounts(
  db: D1Database,
  countedKeys: ReadonlyArray<string>,
  now: EpochMs,
): Promise<boolean> {
  const day = dayOf(now);
  const taken = await db.batch(
    countedKeys.map((key) => db.prepare(TAKE_EMAIL).bind(key, day, EMAILS_PER_DAY_LIMIT)),
  );
  const takenKeys = countedKeys.filter(
    (key) => taken[countedKeys.indexOf(key)]?.meta.changes === 1,
  );
  if (takenKeys.length === countedKeys.length) {
    return true;
  }
  await returnEmailCounts(db, takenKeys, now);
  return false;
}
