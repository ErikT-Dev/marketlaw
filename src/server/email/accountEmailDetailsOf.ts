import * as v from "valibot";
import type { AccountEmail } from "../../shared/api/AccountEmail";
import type { PlayerId } from "../../shared/PlayerId";

const EMAIL_DETAILS_ROW = v.object({
  kind: v.picklist(["guest", "registered"]),
  email: v.nullable(v.string()),
  is_email_confirmed: v.number(),
  pending_email: v.nullable(v.string()),
  is_email_removed: v.number(),
});

export async function accountEmailDetailsOf(
  db: D1Database,
  playerId: PlayerId,
): Promise<AccountEmail | null> {
  const row = await db
    .prepare(
      "SELECT kind, email, is_email_confirmed, pending_email, is_email_removed FROM players WHERE id = ?",
    )
    .bind(playerId)
    .first();
  const parsed = v.safeParse(EMAIL_DETAILS_ROW, row);
  if (!parsed.success || parsed.output.kind === "guest") {
    return null;
  }
  const { email, is_email_confirmed: isConfirmed, pending_email: pending } = parsed.output;
  return {
    address: email,
    isConfirmed: isConfirmed === 1,
    pendingAddress: pending,
    wasRemoved: parsed.output.is_email_removed === 1,
  };
}
