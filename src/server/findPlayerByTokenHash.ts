import { findSessionAccount } from "./findSessionAccount";
import type { Identity } from "./room/Identity";

export async function findPlayerByTokenHash(
  db: D1Database,
  tokenHash: string,
  now: number = Date.now(),
): Promise<Identity | null> {
  return (await findSessionAccount(db, tokenHash, now))?.identity ?? null;
}
