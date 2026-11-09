import { FAILED_LOGIN_LIMITS } from "./accounts/FAILED_LOGIN_LIMITS";
import type { FailedLogins } from "./accounts/FailedLogins";

export async function recordUnknownLoginFailure(
  db: D1Database,
  keyHash: string,
  failure: { readonly failedLogins: FailedLogins; readonly now: number },
): Promise<void> {
  await db
    .prepare(
      "INSERT OR REPLACE INTO unknown_login_failures (key_hash, failed_logins_ms, login_check_until_ms, forget_after_ms) VALUES (?, ?, ?, ?)",
    )
    .bind(
      keyHash,
      JSON.stringify(failure.failedLogins.timesMs),
      failure.failedLogins.humanCheckUntilMs,
      failure.now + FAILED_LOGIN_LIMITS.windowMs,
    )
    .run();
}
