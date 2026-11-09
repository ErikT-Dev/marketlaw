import type { PlayerId } from "../shared/PlayerId";
import { newSessionToken } from "./newSessionToken";
import { sha256Hex } from "./sha256Hex";

export async function insertLogin(
  db: D1Database,
  playerId: PlayerId,
  options: { readonly now: number; readonly isClearingFailedLogins: boolean },
): Promise<string> {
  const token = newSessionToken();
  const login = db
    .prepare(
      "INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms) VALUES (?, ?, ?, ?)",
    )
    .bind(await sha256Hex(token), playerId, options.now, options.now);
  const clearFailedLogins = db
    .prepare("UPDATE players SET failed_logins_ms = '[]', login_check_until_ms = NULL WHERE id = ?")
    .bind(playerId);
  await db.batch(options.isClearingFailedLogins ? [login, clearFailedLogins] : [login]);
  return token;
}
