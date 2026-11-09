import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { loginStateOf } from "./accounts/loginStateOf";
import type { Identity } from "./room/Identity";

const LOGIN_ROW = v.object({ id: PlayerId, name: v.string(), last_used_ms: v.number() });

export async function findPlayerByTokenHash(
  db: D1Database,
  tokenHash: string,
  now: number = Date.now(),
): Promise<Identity | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, logins.last_used_ms AS last_used_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
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
  return { playerId: parsed.output.id, name: parsed.output.name };
}
