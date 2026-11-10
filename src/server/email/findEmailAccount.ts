import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import { loginStateOf } from "../accounts/loginStateOf";
import type { EmailAccount } from "./EmailAccount";

const EMAIL_ACCOUNT_ROW = v.object({
  id: PlayerId,
  kind: v.picklist(["guest", "registered"]),
  email: v.nullable(v.string()),
  is_email_confirmed: v.number(),
  last_used_ms: v.number(),
});

export async function findEmailAccount(
  db: D1Database,
  tokenHash: string,
  now: number,
): Promise<EmailAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.kind AS kind, players.email AS email, players.is_email_confirmed AS is_email_confirmed, logins.last_used_ms AS last_used_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(EMAIL_ACCOUNT_ROW, row);
  if (!parsed.success || loginStateOf(parsed.output.last_used_ms, now) === "expired") {
    return null;
  }
  const { id, kind, email, is_email_confirmed: isConfirmed } = parsed.output;
  return {
    playerId: id,
    isGuest: kind === "guest",
    unconfirmedEmail: isConfirmed === 1 ? null : email,
  };
}
