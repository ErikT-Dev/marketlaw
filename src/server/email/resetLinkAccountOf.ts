import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import type { Identity } from "../room/Identity";

const RESET_ACCOUNT_ROW = v.object({ id: PlayerId, name: v.string() });

export async function resetLinkAccountOf(
  db: D1Database,
  link: { readonly tokenHash: string; readonly now: number },
): Promise<Identity | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.name AS name FROM email_links JOIN players ON players.id = email_links.player_id WHERE email_links.token_hash = ? AND email_links.kind = 'reset' AND email_links.expires_ms > ? AND players.kind = 'registered'",
    )
    .bind(link.tokenHash, link.now)
    .first();
  const parsed = v.safeParse(RESET_ACCOUNT_ROW, row);
  return parsed.success ? { playerId: parsed.output.id, name: parsed.output.name } : null;
}
