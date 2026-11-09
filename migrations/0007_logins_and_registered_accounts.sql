CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_key TEXT,
  created_ms INTEGER NOT NULL,
  is_test_room_seat INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'guest' CHECK (kind IN ('guest', 'registered')),
  password_hash TEXT,
  email TEXT,
  email_key TEXT,
  email_entered_ms INTEGER,
  is_email_confirmed INTEGER NOT NULL DEFAULT 0,
  failed_logins_ms TEXT NOT NULL DEFAULT '[]',
  username_changed_ms INTEGER
) WITHOUT ROWID;
CREATE TABLE logins (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  created_ms INTEGER NOT NULL,
  last_used_ms INTEGER NOT NULL
) WITHOUT ROWID;
INSERT INTO accounts (id, name, name_key, created_ms, is_test_room_seat)
  SELECT id, name, name_key, created_ms, is_test_room_seat FROM players;
INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms)
  SELECT token_hash, id, created_ms, last_used_ms FROM players;
DROP TABLE players;
ALTER TABLE accounts RENAME TO players;
CREATE UNIQUE INDEX players_name_key ON players (name_key);
CREATE INDEX players_email_key ON players (email_key, is_email_confirmed DESC, email_entered_ms)
  WHERE email_key IS NOT NULL;
CREATE INDEX logins_player ON logins (player_id);
