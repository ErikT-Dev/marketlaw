import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import type { LogoutAccount } from "./LogoutAccount";

const LOGOUT_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  kind: v.picklist(["guest", "registered"]),
  last_used_ms: v.number(),
});

export async function findLogoutAccount(
  db: D1Database,
  tokenHash: string,
): Promise<LogoutAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name, players.kind AS kind, logins.last_used_ms AS last_used_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(LOGOUT_ROW, row);
  return parsed.success
    ? {
        identity: { playerId: parsed.output.id, name: parsed.output.name },
        isGuest: parsed.output.kind === "guest",
        lastUsedMs: parsed.output.last_used_ms,
      }
    : null;
}
