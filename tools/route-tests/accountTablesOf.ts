import type { RouteTestDatabase } from "./RouteTestDatabase.ts";

async function rowsOf(db: RouteTestDatabase, sql: string): Promise<ReadonlyArray<unknown>> {
  return (await db.prepare(sql).all()).results;
}

export async function accountTablesOf(db: RouteTestDatabase) {
  return {
    players: await rowsOf(db, "SELECT * FROM players ORDER BY id"),
    logins: await rowsOf(db, "SELECT * FROM logins ORDER BY token_hash"),
    unknownLoginFailures: await rowsOf(
      db,
      "SELECT * FROM unknown_login_failures ORDER BY key_hash",
    ),
  };
}
