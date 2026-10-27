import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import type { Identity } from "./room/Identity";

const PLAYER_ROW = v.object({ id: PlayerId, name: v.string() });

export async function findPlayerByTokenHash(
  db: D1Database,
  tokenHash: string,
): Promise<Identity | null> {
  const row = await db
    .prepare("SELECT id, name FROM players WHERE token_hash = ?")
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(PLAYER_ROW, row);
  return parsed.success ? { playerId: parsed.output.id, name: parsed.output.name } : null;
}
