import * as v from "valibot";
import { HumanCheckResponse } from "../../shared/api/HumanCheckResponse";
import { getJson } from "./getJson";

export async function requestHumanCheckKey(): Promise<string | null> {
  const parsed = v.safeParse(HumanCheckResponse, await getJson("/api/human-check"));
  return parsed.success ? parsed.output.siteKey : null;
}
