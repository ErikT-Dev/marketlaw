import { EMAILS_PER_DAY_LIMIT } from "./EMAILS_PER_DAY_LIMIT";
import type { EmailCounts } from "./EmailCounts";

export function emailLimitRejection(counts: EmailCounts): "email_limit_reached" | null {
  return counts.account >= EMAILS_PER_DAY_LIMIT || counts.address >= EMAILS_PER_DAY_LIMIT
    ? "email_limit_reached"
    : null;
}
