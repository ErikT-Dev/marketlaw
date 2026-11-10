import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import { emailKeyOf } from "../accounts/emailKeyOf";

const CONFIRMED_ROW = v.object({ id: PlayerId, email: v.string() });

export async function confirmedAccountOf(
  db: D1Database,
  email: string,
): Promise<{ readonly playerId: PlayerId; readonly email: string } | null> {
  const row = await db
    .prepare(
      "SELECT id, email FROM players WHERE email_key = ? AND is_email_confirmed = 1 AND kind = 'registered' LIMIT 1",
    )
    .bind(emailKeyOf(email))
    .first();
  const parsed = v.safeParse(CONFIRMED_ROW, row);
  return parsed.success ? { playerId: parsed.output.id, email: parsed.output.email } : null;
}
