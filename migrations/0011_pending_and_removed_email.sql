ALTER TABLE players ADD COLUMN pending_email TEXT;
ALTER TABLE players ADD COLUMN pending_email_key TEXT;
ALTER TABLE players ADD COLUMN is_email_removed INTEGER NOT NULL DEFAULT 0;
CREATE INDEX players_pending_email_key ON players (pending_email_key)
  WHERE pending_email_key IS NOT NULL;
