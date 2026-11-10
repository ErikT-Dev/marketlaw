CREATE TABLE email_links (
  player_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('confirm', 'change_confirm', 'reset')),
  token_hash TEXT NOT NULL,
  address TEXT,
  expires_ms INTEGER NOT NULL,
  PRIMARY KEY (player_id, kind)
) WITHOUT ROWID;
CREATE UNIQUE INDEX email_links_token ON email_links (token_hash);
CREATE TABLE email_counts (
  counted_key TEXT NOT NULL,
  day INTEGER NOT NULL,
  emails INTEGER NOT NULL,
  PRIMARY KEY (counted_key, day)
) WITHOUT ROWID;
CREATE TABLE test_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sent_ms INTEGER NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  text TEXT NOT NULL
);
