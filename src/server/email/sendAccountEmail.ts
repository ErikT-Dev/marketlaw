import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { dayOf } from "../lobby/dayOf";
import { newSessionToken } from "../newSessionToken";
import { sha256Hex } from "../sha256Hex";
import type { AccountEmailKind } from "./AccountEmailKind";
import type { AccountEmailMessage } from "./AccountEmailMessage";
import { accountCountKeyOf } from "./accountCountKeyOf";
import { accountEmailOf } from "./accountEmailOf";
import { EMAIL_LINK_LIFETIME_MS } from "./EMAIL_LINK_LIFETIME_MS";
import { emailSenderOf } from "./emailSenderOf";
import { returnAccountEmail } from "./returnAccountEmail";

type AccountEmail = {
  readonly playerId: PlayerId;
  readonly kind: AccountEmailKind;
  readonly to: string;
  readonly siteUrl: string;
  readonly now: EpochMs;
  readonly countedKeys: ReadonlyArray<string>;
};

const COUNT_NEW_ACCOUNT_EMAIL =
  "INSERT INTO email_counts (counted_key, day, emails) VALUES (?, ?, 1) ON CONFLICT (counted_key, day) DO UPDATE SET emails = emails + 1";

const SAVE_LINK =
  "INSERT INTO email_links (player_id, kind, token_hash, address, expires_ms) VALUES (?, ?, ?, ?, ?) ON CONFLICT (player_id, kind) DO UPDATE SET token_hash = excluded.token_hash, address = excluded.address, expires_ms = excluded.expires_ms";

function messageOf(email: AccountEmail, token: string): AccountEmailMessage {
  return email.kind === "already_in_use"
    ? { kind: email.kind, to: email.to }
    : { kind: email.kind, to: email.to, token };
}

async function recordSent(env: Env, email: AccountEmail, token: string): Promise<void> {
  const accountKey = accountCountKeyOf(email.playerId);
  const accountCounts = email.countedKeys.includes(accountKey)
    ? []
    : [env.DB.prepare(COUNT_NEW_ACCOUNT_EMAIL).bind(accountKey, dayOf(email.now))];
  const links =
    email.kind === "already_in_use"
      ? []
      : [
          env.DB.prepare(SAVE_LINK).bind(
            email.playerId,
            email.kind,
            await sha256Hex(token),
            email.kind === "change_confirm" ? email.to : null,
            email.now + EMAIL_LINK_LIFETIME_MS[email.kind],
          ),
        ];
  const writes = [...links, ...accountCounts];
  if (writes.length > 0) {
    await env.DB.batch(writes);
  }
}

export async function sendAccountEmail(env: Env, email: AccountEmail): Promise<void> {
  const token = newSessionToken();
  const outgoing = accountEmailOf(messageOf(email, token), email.siteUrl);
  const result = await emailSenderOf(env, email.now).send(outgoing);
  if (result === "sent") {
    await recordSent(env, email, token);
  } else {
    await returnAccountEmail(env, email.countedKeys, email.now);
  }
}
