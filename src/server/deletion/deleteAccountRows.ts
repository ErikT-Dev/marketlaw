import type { PlayerId } from "../../shared/PlayerId";

export async function deleteAccountRows(db: D1Database, playerId: PlayerId): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM logins WHERE player_id = ?").bind(playerId),
    db.prepare("DELETE FROM email_links WHERE player_id = ?").bind(playerId),
    db.prepare("DELETE FROM ratings WHERE player_id = ?").bind(playerId),
    db.prepare("DELETE FROM players WHERE id = ?").bind(playerId),
  ]);
}
