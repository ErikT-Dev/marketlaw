import * as v from "valibot";
import { PrivacyContactResponse } from "../../shared/api/PrivacyContactResponse";
import { getJson } from "./getJson";

export async function requestPrivacyContact(): Promise<string | null> {
  const parsed = v.safeParse(PrivacyContactResponse, await getJson("/api/privacy-contact"));
  return parsed.success ? parsed.output.contact : null;
}
