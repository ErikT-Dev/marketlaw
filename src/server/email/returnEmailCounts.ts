import type { EpochMs } from "../../shared/EpochMs";
import { dayOf } from "../lobby/dayOf";

const RETURN_EMAIL =
  "UPDATE email_counts SET emails = emails - 1 WHERE counted_key = ? AND day = ? AND emails > 0";

export async function returnEmailCounts(
  db: D1Database,
  countedKeys: ReadonlyArray<string>,
  now: EpochMs,
): Promise<void> {
  if (countedKeys.length > 0) {
    const day = dayOf(now);
    await db.batch(countedKeys.map((key) => db.prepare(RETURN_EMAIL).bind(key, day)));
  }
}
