import * as v from "valibot";
import type { FailedLogins } from "./accounts/FailedLogins";
import { NO_FAILED_LOGINS } from "./accounts/NO_FAILED_LOGINS";

const UNKNOWN_LOGIN_FAILURES_ROW = v.object({
  failed_logins_ms: v.pipe(v.string(), v.parseJson(), v.array(v.number())),
  login_check_until_ms: v.nullable(v.number()),
});

export async function findUnknownLoginFailures(
  db: D1Database,
  keyHash: string,
): Promise<FailedLogins> {
  const row = await db
    .prepare(
      "SELECT failed_logins_ms, login_check_until_ms FROM unknown_login_failures WHERE key_hash = ?",
    )
    .bind(keyHash)
    .first();
  const parsed = v.safeParse(UNKNOWN_LOGIN_FAILURES_ROW, row);
  return parsed.success
    ? {
        timesMs: parsed.output.failed_logins_ms,
        humanCheckUntilMs: parsed.output.login_check_until_ms,
      }
    : NO_FAILED_LOGINS;
}
