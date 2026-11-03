DELETE FROM players;
ALTER TABLE players ADD COLUMN name_key TEXT;
ALTER TABLE players ADD COLUMN last_used_ms INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX players_name_key ON players (name_key);
