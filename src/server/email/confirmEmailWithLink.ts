function liveLinkAccount(kind: "confirm" | "change_confirm"): string {
  return `SELECT player_id FROM email_links WHERE token_hash = ?1 AND kind = '${kind}' AND expires_ms > ?2`;
}

function noOtherAccountConfirming(keyColumn: string): string {
  return `NOT EXISTS (SELECT 1 FROM players AS confirmed WHERE confirmed.id <> players.id AND confirmed.is_email_confirmed = 1 AND confirmed.email_key = ${keyColumn})`;
}

const CONFIRM_ADDRESS = `UPDATE players SET is_email_confirmed = 1 WHERE id = (${liveLinkAccount("confirm")}) AND email_key IS NOT NULL AND is_email_confirmed = 0 AND ${noOtherAccountConfirming("players.email_key")}`;

const CONFIRM_CHANGE = `UPDATE players SET email = pending_email, email_key = pending_email_key, email_entered_ms = ?2, is_email_confirmed = 1, is_email_removed = 0, pending_email = NULL, pending_email_key = NULL WHERE id = (${liveLinkAccount("change_confirm")}) AND pending_email = (SELECT address FROM email_links WHERE token_hash = ?1) AND ${noOtherAccountConfirming("players.pending_email_key")}`;

const CONFIRMED_KEY =
  "SELECT confirmed.email_key FROM players AS confirmed JOIN email_links ON email_links.player_id = confirmed.id WHERE email_links.token_hash = ?1 AND confirmed.is_email_confirmed = 1 AND (email_links.kind = 'confirm' OR (email_links.kind = 'change_confirm' AND confirmed.email = email_links.address))";

const REMOVE_FROM_OTHER_ACCOUNTS = `UPDATE players SET email = NULL, email_key = NULL, email_entered_ms = NULL, is_email_removed = 1 WHERE is_email_confirmed = 0 AND email_key = (${CONFIRMED_KEY})`;

const DROP_OTHER_PENDING_CHANGES = `UPDATE players SET pending_email = NULL, pending_email_key = NULL WHERE pending_email_key = (${CONFIRMED_KEY}) AND id <> (SELECT player_id FROM email_links WHERE token_hash = ?1)`;

const USE_LINK = "DELETE FROM email_links WHERE token_hash = ?1";

export async function confirmEmailWithLink(
  db: D1Database,
  link: { readonly tokenHash: string; readonly now: number },
): Promise<boolean> {
  const [confirmed, changed] = await db.batch([
    db.prepare(CONFIRM_ADDRESS).bind(link.tokenHash, link.now),
    db.prepare(CONFIRM_CHANGE).bind(link.tokenHash, link.now),
    db.prepare(REMOVE_FROM_OTHER_ACCOUNTS).bind(link.tokenHash),
    db.prepare(DROP_OTHER_PENDING_CHANGES).bind(link.tokenHash),
    db.prepare(USE_LINK).bind(link.tokenHash),
  ]);
  return confirmed?.meta.changes === 1 || changed?.meta.changes === 1;
}
