const LIVE_CONFIRM_LINK =
  "SELECT player_id FROM email_links WHERE token_hash = ?1 AND kind = 'confirm' AND expires_ms > ?2";

const CONFIRM_ADDRESS = `UPDATE players SET is_email_confirmed = 1 WHERE id = (${LIVE_CONFIRM_LINK}) AND email_key IS NOT NULL AND is_email_confirmed = 0 AND NOT EXISTS (SELECT 1 FROM players AS confirmed WHERE confirmed.email_key = players.email_key AND confirmed.is_email_confirmed = 1)`;

const REMOVE_FROM_OTHER_ACCOUNTS =
  "UPDATE players SET email = NULL, email_key = NULL, email_entered_ms = NULL WHERE is_email_confirmed = 0 AND email_key = (SELECT confirmed.email_key FROM players AS confirmed JOIN email_links ON email_links.player_id = confirmed.id WHERE email_links.token_hash = ?1 AND email_links.kind = 'confirm' AND confirmed.is_email_confirmed = 1)";

const USE_LINK = "DELETE FROM email_links WHERE token_hash = ?1";

export async function confirmEmailWithLink(
  db: D1Database,
  link: { readonly tokenHash: string; readonly now: number },
): Promise<boolean> {
  const [confirmed] = await db.batch([
    db.prepare(CONFIRM_ADDRESS).bind(link.tokenHash, link.now),
    db.prepare(REMOVE_FROM_OTHER_ACCOUNTS).bind(link.tokenHash),
    db.prepare(USE_LINK).bind(link.tokenHash),
  ]);
  return confirmed?.meta.changes === 1;
}
