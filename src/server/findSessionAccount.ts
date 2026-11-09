import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { loginStateOf } from "./accounts/loginStateOf";
import type { SessionAccount } from "./SessionAccount";

const LOGIN_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  kind: v.picklist(["guest", "registered"]),
  last_used_ms: v.number(),
});

export async function findSessionAccount(
  db: D1Database,
  tokenHash: string,
  now: number = Date.now(),
): Promise<SessionAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, players.kind AS kind, logins.last_used_ms AS last_used_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(LOGIN_ROW, row);
  if (!parsed.success) {
    return null;
  }
  const state = loginStateOf(parsed.output.last_used_ms, now);
  if (state === "expired") {
    return null;
  }
  if (state === "record_use") {
    await db
      .prepare("UPDATE logins SET last_used_ms = ? WHERE token_hash = ?")
      .bind(now, tokenHash)
      .run();
  }
  return {
    identity: { playerId: parsed.output.id, name: parsed.output.name },
    isGuest: parsed.output.kind === "guest",
  };
}
