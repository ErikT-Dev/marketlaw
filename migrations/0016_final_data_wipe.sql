DELETE FROM game_records WHERE id IN (
  SELECT game_record_players.game_id FROM game_record_players
  JOIN players ON players.id = game_record_players.player_id
  WHERE players.is_test_room_seat = 1
);
DELETE FROM game_records WHERE json_extract(record, '$.kind') IS NOT 'ranked';
DELETE FROM game_record_players WHERE game_id NOT IN (SELECT id FROM game_records);
UPDATE game_records SET record = json_set(record, '$.seats', json((
  SELECT json_group_array(json_set(seat.value, '$.income', json_extract(seat.value, '$.income') * 10))
  FROM json_each(game_records.record, '$.seats') AS seat
)))
WHERE EXISTS (
  SELECT 1 FROM json_each(game_records.record, '$.seats') AS seat
  WHERE json_extract(seat.value, '$.fundsAndHand') IS NOT NULL
);
DELETE FROM replay_records
WHERE coalesce(json_extract(record, '$.setup.kind'), 'ranked') IS NOT 'ranked'
  OR NOT EXISTS (
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
