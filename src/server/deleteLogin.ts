export async function deleteLogin(db: D1Database, tokenHash: string): Promise<void> {
  await db.prepare("DELETE FROM logins WHERE token_hash = ?").bind(tokenHash).run();
}
