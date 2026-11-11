import type { PlayerId } from "../shared/PlayerId";
import { nameKeyOf } from "./accounts/nameKeyOf";
import { USERNAME_CHANGE_WAIT_MS } from "./accounts/USERNAME_CHANGE_WAIT_MS";
import { USERNAME_CHANGES_IN_WAIT } from "./accounts/USERNAME_CHANGES_IN_WAIT";
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
      "UPDATE OR IGNORE players SET name = ?, name_key = ?, username_changes_ms = ? WHERE id = ? AND (SELECT count(*) FROM json_each(players.username_changes_ms) WHERE json_each.value > ?) < ?",
    )
    .bind(
      rename.name,
      nameKeyOf(rename.name),
      JSON.stringify(usernameChangesWith(rename.changesMs, rename.now)),
      playerId,
      rename.now - USERNAME_CHANGE_WAIT_MS,
      USERNAME_CHANGES_IN_WAIT,
    )
    .run();
  return meta.changes === 1;
}
