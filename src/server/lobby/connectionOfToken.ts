import { findPlayerByTokenHash } from "../findPlayerByTokenHash";
import { sha256Hex } from "../sha256Hex";
import type { OnlineConnection } from "./OnlineConnection";
import { onlineConnectionOf } from "./onlineConnectionOf";

export async function connectionOfToken(
  db: D1Database,
  token: string,
): Promise<OnlineConnection | null> {
  const tokenHash = await sha256Hex(token);
  const identity = await findPlayerByTokenHash(db, tokenHash);
  return identity === null ? null : onlineConnectionOf(db, { identity, tokenHash });
}
