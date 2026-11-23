import * as v from "valibot";
import { storedPlayerIconOf } from "../accounts/storedPlayerIconOf";
import { PlayerId } from "../../shared/PlayerId";
import { loginStateOf } from "../accounts/loginStateOf";
import type { DeletingAccount } from "./DeletingAccount";

const DELETING_ACCOUNT_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  icon: v.unknown(),
  kind: v.picklist(["guest", "registered"]),
  password_hash: v.nullable(v.string()),
  last_used_ms: v.number(),
});

export async function findDeletingAccount(
  db: D1Database,
  tokenHash: string,
  now: number,
): Promise<DeletingAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, players.icon AS icon, players.kind AS kind, players.password_hash AS password_hash, logins.last_used_ms AS last_used_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(DELETING_ACCOUNT_ROW, row);
  if (!parsed.success || loginStateOf(parsed.output.last_used_ms, now) === "expired") {
    return null;
  }
  const { id, name, icon, kind, password_hash: passwordHash } = parsed.output;
  return {
    identity: { playerId: id, name, icon: storedPlayerIconOf(icon, id) },
    passwordHash,
    isGuest: kind === "guest",
  };
}
