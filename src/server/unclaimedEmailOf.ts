import { emailKeyOf } from "./accounts/emailKeyOf";

export async function unclaimedEmailOf(db: D1Database, email: string): Promise<string | null> {
  const confirmed = await db
    .prepare(
      "SELECT 1 AS found FROM players WHERE email_key = ? AND is_email_confirmed = 1 LIMIT 1",
    )
    .bind(emailKeyOf(email))
    .first();
  return confirmed === null ? email : null;
}
