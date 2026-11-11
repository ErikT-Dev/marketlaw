ALTER TABLE players ADD COLUMN username_changes_ms TEXT NOT NULL DEFAULT '[]';
UPDATE players SET username_changes_ms = json_array(username_changed_ms)
  WHERE username_changed_ms IS NOT NULL;
ALTER TABLE players DROP COLUMN username_changed_ms;
