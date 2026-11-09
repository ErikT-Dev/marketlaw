import type { PlayerId } from "../shared/PlayerId";
import { nameKeyOf } from "./accounts/nameKeyOf";
import { USERNAME_CHANGE_WAIT_MS } from "./accounts/USERNAME_CHANGE_WAIT_MS";

export async function renamePlayer(
  db: D1Database,
  playerId: PlayerId,
  rename: { readonly name: string; readonly now: number },
): Promise<boolean> {
  const { meta } = await db
    .prepare(
      "UPDATE OR IGNORE players SET name = ?, name_key = ?, username_changed_ms = ? WHERE id = ? AND (username_changed_ms IS NULL OR username_changed_ms <= ?)",
    )
    .bind(
      rename.name,
      nameKeyOf(rename.name),
      rename.now,
      playerId,
      rename.now - USERNAME_CHANGE_WAIT_MS,
    )
    .run();
  return meta.changes === 1;
}
