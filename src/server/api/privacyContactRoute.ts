import * as v from "valibot";
import type { PrivacyContactResponse } from "../../shared/api/PrivacyContactResponse";

const PRIVACY_CONTACT_ENV = v.object({ PRIVACY_CONTACT: v.pipe(v.string(), v.minLength(1)) });

export function privacyContactRoute(env: Env): Response {
  const parsed = v.safeParse(PRIVACY_CONTACT_ENV, env);
  const body: PrivacyContactResponse = {
    contact: parsed.success ? parsed.output.PRIVACY_CONTACT : null,
  };
  return Response.json(body);
}
