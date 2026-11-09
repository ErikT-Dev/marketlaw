import { mkdirSync } from "node:fs";
import { createTestHarness, type TestHarness } from "wrangler";

const ALWAYS_PASSING_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
const CLIENT_ASSETS_DIRECTORY = "./dist/client";

export async function startRouteTestServer(): Promise<TestHarness> {
  mkdirSync(CLIENT_ASSETS_DIRECTORY, { recursive: true });
  const server = createTestHarness({
    workers: [
      {
        configPath: "./wrangler.jsonc",
        secrets: { TURNSTILE_SECRET_KEY: ALWAYS_PASSING_TURNSTILE_SECRET },
      },
    ],
  });
  await server.listen();
  await server.getWorker().applyD1Migrations("DB");
  return server;
}
