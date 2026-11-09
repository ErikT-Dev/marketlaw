import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { loginStateOf } from "./accounts/loginStateOf";
import type { RenameAccount } from "./RenameAccount";

const RENAME_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  last_used_ms: v.number(),
  username_changed_ms: v.nullable(v.number()),
});

export async function findRenameAccount(
  db: D1Database,
  tokenHash: string,
  now: number,
): Promise<RenameAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, logins.last_used_ms AS last_used_ms, players.username_changed_ms AS username_changed_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(RENAME_ROW, row);
  if (!parsed.success || loginStateOf(parsed.output.last_used_ms, now) === "expired") {
    return null;
  }
  const { id, name, username_changed_ms: usernameChangedMs } = parsed.output;
  return { identity: { playerId: id, name }, usernameChangedMs };
}
