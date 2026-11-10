import type { PlayerId } from "../../shared/PlayerId";

const DROP_PENDING =
  "UPDATE players SET pending_email = NULL, pending_email_key = NULL WHERE id = ? AND kind = 'registered'";

const DROP_CHANGE_LINK = "DELETE FROM email_links WHERE player_id = ? AND kind = 'change_confirm'";

export async function dropPendingEmail(db: D1Database, playerId: PlayerId): Promise<void> {
  await db.batch([
    db.prepare(DROP_PENDING).bind(playerId),
    db.prepare(DROP_CHANGE_LINK).bind(playerId),
  ]);
}
