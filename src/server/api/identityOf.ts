import type { Identity } from "../room/Identity";
import { findPlayerByTokenHash } from "../findPlayerByTokenHash";
import { sha256Hex } from "../sha256Hex";

export async function identityOf(token: string, env: Env): Promise<Identity | null> {
  return findPlayerByTokenHash(env.DB, await sha256Hex(token));
}
