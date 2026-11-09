import { createTestHarness, type TestHarness } from "wrangler";

const ALWAYS_PASSING_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";

export async function startRouteTestServer(): Promise<TestHarness> {
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
