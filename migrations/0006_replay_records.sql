CREATE TABLE replay_records (
  room_code TEXT NOT NULL,
  ended_ms INTEGER NOT NULL,
  record TEXT NOT NULL,
  PRIMARY KEY (room_code, ended_ms)
);
CREATE INDEX replay_records_ended ON replay_records (ended_ms);
