import type { PlayerId } from "../shared/PlayerId";
import { nameKeyOf } from "./accounts/nameKeyOf";
import { usernameChangesWith } from "./accounts/usernameChangesWith";

export async function renamePlayer(
  db: D1Database,
  playerId: PlayerId,
  rename: {
    readonly name: string;
    readonly now: number;
    readonly changesMs: ReadonlyArray<number>;
  },
): Promise<boolean> {
  const { meta } = await db
    .prepare(
      "UPDATE OR IGNORE players SET name = ?, name_key = ?, username_changes_ms = ? WHERE id = ? AND json(username_changes_ms) = json(?)",
    )
    .bind(
      rename.name,
      nameKeyOf(rename.name),
      JSON.stringify(usernameChangesWith(rename.changesMs, rename.now)),
      playerId,
      JSON.stringify(rename.changesMs),
    )
    .run();
  return meta.changes === 1;
}
