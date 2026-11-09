export async function removeForgottenLoginFailures(db: D1Database, now: number): Promise<void> {
  await db.prepare("DELETE FROM unknown_login_failures WHERE forget_after_ms <= ?").bind(now).run();
}
