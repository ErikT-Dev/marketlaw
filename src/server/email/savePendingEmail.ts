import type { PlayerId } from "../../shared/PlayerId";
import { emailKeyOf } from "../accounts/emailKeyOf";

const SAVE_PENDING =
  "UPDATE players SET pending_email = ?, pending_email_key = ? WHERE id = ? AND kind = 'registered'";

const DROP_OLDER_CHANGE_LINK =
  "DELETE FROM email_links WHERE player_id = ? AND kind = 'change_confirm'";

export async function savePendingEmail(
  db: D1Database,
  pending: { readonly playerId: PlayerId; readonly email: string },
): Promise<void> {
  await db.batch([
    db.prepare(SAVE_PENDING).bind(pending.email, emailKeyOf(pending.email), pending.playerId),
    db.prepare(DROP_OLDER_CHANGE_LINK).bind(pending.playerId),
  ]);
}
