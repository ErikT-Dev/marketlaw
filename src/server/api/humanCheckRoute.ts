import type { HumanCheckResponse } from "../../shared/api/HumanCheckResponse";
import { humanCheckKeysOf } from "../humanCheckKeysOf";

export function humanCheckRoute(env: Env): Response {
  const body: HumanCheckResponse = { siteKey: humanCheckKeysOf(env)?.siteKey ?? null };
  return Response.json(body);
}
