import type { PlayerId } from "../../shared/PlayerId";
import { newSessionToken } from "../newSessionToken";
import { sha256Hex } from "../sha256Hex";

const LIVE_RESET_LINK =
  "EXISTS (SELECT 1 FROM email_links WHERE token_hash = ?1 AND kind = 'reset' AND expires_ms > ?2 AND player_id = ?3)";

export async function setPasswordWithLink(
  db: D1Database,
  reset: {
    readonly tokenHash: string;
    readonly now: number;
    readonly playerId: PlayerId;
    readonly passwordHash: string;
  },
): Promise<string | null> {
  const token = newSessionToken();
  const linkParts = [reset.tokenHash, reset.now, reset.playerId] as const;
  const [changed] = await db.batch([
    db
      .prepare(
        `UPDATE players SET password_hash = ?4, failed_logins_ms = '[]', login_check_until_ms = NULL WHERE id = ?3 AND ${LIVE_RESET_LINK}`,
      )
      .bind(...linkParts, reset.passwordHash),
    db.prepare(`DELETE FROM logins WHERE player_id = ?3 AND ${LIVE_RESET_LINK}`).bind(...linkParts),
    db
      .prepare(
        `INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms) SELECT ?4, ?3, ?2, ?2 WHERE ${LIVE_RESET_LINK}`,
      )
      .bind(...linkParts, await sha256Hex(token)),
    db.prepare("DELETE FROM email_links WHERE token_hash = ?1").bind(reset.tokenHash),
  ]);
  return changed?.meta.changes === 1 ? token : null;
}
