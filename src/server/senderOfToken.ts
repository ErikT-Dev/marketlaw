import type { ConnectionAttachment } from "./ConnectionAttachment";
import { findPlayerByTokenHash } from "./findPlayerByTokenHash";
import type { Sender } from "./Sender";
import { sha256Hex } from "./sha256Hex";

export async function senderOfToken(
  db: D1Database,
  token: string,
  attachment: ConnectionAttachment,
): Promise<Sender | null> {
  const tokenHash = await sha256Hex(token);
  if (attachment.identity !== null && attachment.tokenHash === tokenHash) {
    return { identity: attachment.identity, tokenHash };
  }
  const identity = await findPlayerByTokenHash(db, tokenHash);
  return identity === null ? null : { identity, tokenHash };
}
