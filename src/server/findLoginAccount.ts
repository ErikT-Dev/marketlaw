import * as v from "valibot";
import { storedPlayerIconOf } from "./accounts/storedPlayerIconOf";
import { PlayerId } from "../shared/PlayerId";
import { loginLookupOf } from "./accounts/loginLookupOf";
import type { LoginAccount } from "./LoginAccount";

const COLUMNS =
  "SELECT id, name, icon, password_hash, failed_logins_ms, login_check_until_ms FROM players WHERE kind = 'registered'";
const BY_NAME = `${COLUMNS} AND name_key = ?`;
const BY_EMAIL = `${COLUMNS} AND email_key = ? ORDER BY is_email_confirmed DESC, email_entered_ms LIMIT 1`;

const LOGIN_ACCOUNT_ROW = v.object({
  id: PlayerId,
  name: v.string(),
  icon: v.unknown(),
  password_hash: v.string(),
  failed_logins_ms: v.pipe(v.string(), v.parseJson(), v.array(v.number())),
  login_check_until_ms: v.nullable(v.number()),
});

export async function findLoginAccount(
  db: D1Database,
  login: string,
): Promise<LoginAccount | null> {
  const lookup = loginLookupOf(login);
  const row = await db
    .prepare(lookup.by === "name" ? BY_NAME : BY_EMAIL)
    .bind(lookup.key)
    .first();
  const parsed = v.safeParse(LOGIN_ACCOUNT_ROW, row);
  return parsed.success
    ? {
        identity: {
          playerId: parsed.output.id,
          name: parsed.output.name,
          icon: storedPlayerIconOf(parsed.output.icon, parsed.output.id),
        },
        passwordHash: parsed.output.password_hash,
        failedLogins: {
          timesMs: parsed.output.failed_logins_ms,
          humanCheckUntilMs: parsed.output.login_check_until_ms,
        },
      }
    : null;
}
