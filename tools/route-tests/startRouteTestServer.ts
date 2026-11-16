import { mkdirSync } from "node:fs";
import { createTestHarness, type TestHarness } from "wrangler";
import { ROUTE_TEST_ROOM_SECRET } from "./ROUTE_TEST_ROOM_SECRET.ts";

const ALWAYS_PASSING_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
const CLIENT_ASSETS_DIRECTORY = "./dist/client";

export async function startRouteTestServer(
  testLimits: Readonly<Record<string, string>> = {},
): Promise<TestHarness> {
  mkdirSync(CLIENT_ASSETS_DIRECTORY, { recursive: true });
  const server = createTestHarness({
    workers: [
      {
        configPath: "./wrangler.jsonc",
        secrets: {
          TURNSTILE_SECRET_KEY: ALWAYS_PASSING_TURNSTILE_SECRET,
          TEST_ROOM_SECRET: ROUTE_TEST_ROOM_SECRET,
          ...testLimits,
        },
      },
    ],
  });
  await server.listen();
  await server.getWorker().applyD1Migrations("DB");
  return server;
}
