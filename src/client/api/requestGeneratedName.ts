import * as v from "valibot";
import { GeneratedNameResponse } from "../../shared/api/GeneratedNameResponse";
import { getJson } from "./getJson";

export async function requestGeneratedName(): Promise<string> {
  const parsed = v.safeParse(GeneratedNameResponse, await getJson("/api/generated-name"));
  return parsed.success ? parsed.output.name : "";
}
