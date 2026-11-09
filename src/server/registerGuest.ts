import type { PlayerId } from "../shared/PlayerId";
import { emailKeyOf } from "./accounts/emailKeyOf";
import { nameKeyOf } from "./accounts/nameKeyOf";
import type { SignupAccount } from "./SignupAccount";

export async function registerGuest(
  db: D1Database,
  playerId: PlayerId,
  account: SignupAccount,
): Promise<boolean> {
  const { meta } = await db
    .prepare(
      "UPDATE OR IGNORE players SET kind = 'registered', name = ?, name_key = ?, password_hash = ?, email = ?, email_key = ?, email_entered_ms = ?, is_email_confirmed = 0 WHERE id = ? AND kind = 'guest'",
    )
    .bind(
      account.name,
      nameKeyOf(account.name),
      account.passwordHash,
      account.email,
      account.email === null ? null : emailKeyOf(account.email),
      account.email === null ? null : account.now,
      playerId,
    )
    .run();
  return meta.changes === 1;
}
