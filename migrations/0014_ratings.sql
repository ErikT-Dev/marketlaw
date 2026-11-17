CREATE TABLE ratings (
  player_id TEXT NOT NULL PRIMARY KEY,
  rating INTEGER NOT NULL,
  ranked_games INTEGER NOT NULL,
  highest_rating INTEGER NOT NULL
) WITHOUT ROWID;
