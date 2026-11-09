CREATE TABLE unknown_login_failures (
  key_hash TEXT PRIMARY KEY,
  failed_logins_ms TEXT NOT NULL,
  login_check_until_ms INTEGER,
  forget_after_ms INTEGER NOT NULL
) WITHOUT ROWID;
