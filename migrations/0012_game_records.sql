CREATE TABLE game_records (
  id TEXT NOT NULL PRIMARY KEY,
  ended_ms INTEGER NOT NULL,
  record TEXT NOT NULL
) WITHOUT ROWID;
CREATE TABLE game_record_players (
  player_id TEXT NOT NULL,
  ended_ms INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  PRIMARY KEY (player_id, ended_ms, game_id)
) WITHOUT ROWID;
