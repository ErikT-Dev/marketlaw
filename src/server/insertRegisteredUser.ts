import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import { emailKeyOf } from "./accounts/emailKeyOf";
import { nameKeyOf } from "./accounts/nameKeyOf";
import { newSessionToken } from "./newSessionToken";
import type { Identity } from "./room/Identity";
import { sha256Hex } from "./sha256Hex";
import type { SignupAccount } from "./SignupAccount";

export async function insertRegisteredUser(
  db: D1Database,
  account: SignupAccount,
): Promise<{ readonly token: string; readonly identity: Identity } | null> {
  const token = newSessionToken();
  const playerId = v.parse(PlayerId, crypto.randomUUID());
  const { name, email, now } = account;
  const [inserted] = await db.batch([
    db
      .prepare(
        "INSERT INTO players (id, name, name_key, created_ms, kind, password_hash, email, email_key, email_entered_ms) VALUES (?, ?, ?, ?, 'registered', ?, ?, ?, ?) ON CONFLICT DO NOTHING",
      )
      .bind(
        playerId,
        name,
        nameKeyOf(name),
        now,
        account.passwordHash,
        email,
        email === null ? null : emailKeyOf(email),
        email === null ? null : now,
      ),
    db
      .prepare(
        "INSERT INTO logins (token_hash, player_id, created_ms, last_used_ms) SELECT ?, id, ?, ? FROM players WHERE id = ?",
      )
      .bind(await sha256Hex(token), now, now, playerId),
  ]);
  return inserted?.meta.changes === 1 ? { token, identity: { playerId, name } } : null;
}
