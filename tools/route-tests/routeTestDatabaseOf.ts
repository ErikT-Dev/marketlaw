import * as v from "valibot";
import type { TestHarness } from "wrangler";
import type { RouteTestDatabase } from "./RouteTestDatabase.ts";

const ROUTE_TEST_ENV = v.object({
  DB: v.custom<RouteTestDatabase>(
    (database) => typeof database === "object" && database !== null && "prepare" in database,
  ),
});

export async function routeTestDatabaseOf(server: TestHarness): Promise<RouteTestDatabase> {
  const env: unknown = await server.getWorker().getEnv();
  return v.parse(ROUTE_TEST_ENV, env).DB;
}
