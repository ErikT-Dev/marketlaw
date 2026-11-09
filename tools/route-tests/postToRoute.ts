import type { TestHarness } from "wrangler";
import type { RouteAnswer } from "./RouteAnswer.ts";

export async function postToRoute(
  server: TestHarness,
  path: string,
  body: Readonly<Record<string, unknown>>,
): Promise<RouteAnswer> {
  const response = await server.fetch(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const answer: unknown = await response.json().catch(() => null);
  return {
    status: response.status,
    body: typeof answer === "object" && answer !== null ? { ...answer } : {},
  };
}
