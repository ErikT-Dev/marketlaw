import { LOGIN_TIMES } from "../accounts/LOGIN_TIMES";
import type { EpochMs } from "../../shared/EpochMs";

const UNUSED_GUEST =
  "players.kind = 'guest' AND COALESCE((SELECT MAX(logins.last_used_ms) FROM logins WHERE logins.player_id = players.id), players.created_ms) < ?1";

export async function removeUnusedGuests(db: D1Database, now: EpochMs): Promise<void> {
  const lastUseCutoff = now - LOGIN_TIMES.expireAfterMs;
  await db.batch([
    db
      .prepare(
        `DELETE FROM logins WHERE player_id IN (SELECT players.id FROM players WHERE ${UNUSED_GUEST})`,
      )
      .bind(lastUseCutoff),
    db.prepare(`DELETE FROM players WHERE ${UNUSED_GUEST}`).bind(lastUseCutoff),
  ]);
}
