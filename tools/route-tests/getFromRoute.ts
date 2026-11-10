import type { TestHarness } from "wrangler";

export async function getFromRoute(
  server: TestHarness,
  path: string,
): Promise<{ readonly status: number; readonly body: unknown }> {
  const response = await server.fetch(`http://localhost${path}`);
  const body: unknown = await response.json().catch(() => null);
  return { status: response.status, body };
}
