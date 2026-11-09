import type { PlayerId } from "../shared/PlayerId";
import type { FailedLogins } from "./accounts/FailedLogins";

export async function recordFailedLogin(
  db: D1Database,
  playerId: PlayerId,
  failedLogins: FailedLogins,
): Promise<void> {
  await db
    .prepare("UPDATE players SET failed_logins_ms = ?, login_check_until_ms = ? WHERE id = ?")
    .bind(JSON.stringify(failedLogins.timesMs), failedLogins.humanCheckUntilMs, playerId)
    .run();
}
