import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { loginStateOf } from "./accounts/loginStateOf";
import type { Identity } from "./room/Identity";

const PLAYER_ROW = v.object({ id: PlayerId, name: v.string(), last_used_ms: v.number() });

export async function findPlayerByTokenHash(
  db: D1Database,
  tokenHash: string,
  now: number = Date.now(),
): Promise<Identity | null> {
  const row = await db
    .prepare("SELECT id, name, last_used_ms FROM players WHERE token_hash = ?")
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(PLAYER_ROW, row);
  if (!parsed.success) {
    return null;
  }
  const state = loginStateOf(parsed.output.last_used_ms, now);
  if (state === "expired") {
    return null;
  }
  if (state === "record_use") {
    await db
      .prepare("UPDATE players SET last_used_ms = ? WHERE id = ?")
      .bind(now, parsed.output.id)
      .run();
  }
  return { playerId: parsed.output.id, name: parsed.output.name };
}
