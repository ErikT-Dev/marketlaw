import * as v from "valibot";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { dayOf } from "../lobby/dayOf";
import { accountCountKeyOf } from "./accountCountKeyOf";
import { addressCountKeyOf } from "./addressCountKeyOf";
import type { EmailCounts } from "./EmailCounts";

const COUNT_ROW = v.object({ counted_key: v.string(), emails: v.number() });

export async function emailCountsToday(
  db: D1Database,
  counted: { readonly playerId: PlayerId | null; readonly address: string; readonly now: EpochMs },
): Promise<EmailCounts> {
  const accountKey = counted.playerId === null ? null : accountCountKeyOf(counted.playerId);
  const addressKey = await addressCountKeyOf(counted.address);
  const { results } = await db
    .prepare("SELECT counted_key, emails FROM email_counts WHERE day = ? AND counted_key IN (?, ?)")
    .bind(dayOf(counted.now), accountKey ?? addressKey, addressKey)
    .all();
  const rows = v.parse(v.array(COUNT_ROW), results);
  const emailsOf = new Map(rows.map((row) => [row.counted_key, row.emails]));
  return {
    account: accountKey === null ? 0 : (emailsOf.get(accountKey) ?? 0),
    address: emailsOf.get(addressKey) ?? 0,
  };
}
