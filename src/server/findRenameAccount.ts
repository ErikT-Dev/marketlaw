import * as v from "valibot";
import { storedPlayerIconOf } from "./accounts/storedPlayerIconOf";
import { PlayerId } from "../shared/PlayerId";
import { loginStateOf } from "./accounts/loginStateOf";
import type { RenameAccount } from "./RenameAccount";

const RENAME_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  icon: v.unknown(),
  last_used_ms: v.number(),
  username_changes_ms: v.pipe(v.string(), v.parseJson(), v.array(v.number())),
  icon_changes_ms: v.pipe(v.string(), v.parseJson(), v.array(v.number())),
});

export async function findRenameAccount(
  db: D1Database,
  tokenHash: string,
  now: number,
): Promise<RenameAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, players.icon AS icon, logins.last_used_ms AS last_used_ms, players.username_changes_ms AS username_changes_ms, players.icon_changes_ms AS icon_changes_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(RENAME_ROW, row);
  if (!parsed.success || loginStateOf(parsed.output.last_used_ms, now) === "expired") {
    return null;
  }
  const {
    id,
    name,
    icon,
    username_changes_ms: usernameChangesMs,
    icon_changes_ms: iconChangesMs,
  } = parsed.output;
  return {
    identity: { playerId: id, name, icon: storedPlayerIconOf(icon, id) },
    usernameChangesMs,
    iconChangesMs,
  };
}
