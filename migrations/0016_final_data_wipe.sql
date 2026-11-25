DELETE FROM game_records WHERE json_extract(record, '$.kind') IS NOT 'ranked';
DELETE FROM game_record_players WHERE game_id NOT IN (SELECT id FROM game_records);
DELETE FROM replay_records WHERE NOT EXISTS (
  SELECT 1 FROM game_records
  WHERE game_records.ended_ms = replay_records.ended_ms
    AND json_extract(game_records.record, '$.startedMs') =
      json_extract(replay_records.record, '$.setup.startedAt')
);
UPDATE replay_records SET record = json_set(record, '$.schemaVersion', 21)
  WHERE json_extract(record, '$.schemaVersion') = 20;
DELETE FROM logins WHERE player_id NOT IN (SELECT player_id FROM game_record_players);
DELETE FROM email_links WHERE player_id NOT IN (SELECT player_id FROM game_record_players);
DELETE FROM ratings WHERE player_id NOT IN (SELECT player_id FROM game_record_players);
DELETE FROM players WHERE id NOT IN (SELECT player_id FROM game_record_players);
DELETE FROM email_counts;
DELETE FROM unknown_login_failures;
DELETE FROM test_outbox;
