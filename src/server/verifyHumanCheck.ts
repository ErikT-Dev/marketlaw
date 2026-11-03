import * as v from "valibot";
import { humanCheckKeysOf } from "./humanCheckKeysOf";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_RESPONSE = v.looseObject({ success: v.boolean() });

export async function verifyHumanCheck(env: unknown, request: Request, response: string) {
  const keys = humanCheckKeysOf(env);
  if (keys === null || response.length === 0) {
    return false;
  }
  const form = new FormData();
  form.append("secret", keys.secretKey);
  form.append("response", response);
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp !== null) {
    form.append("remoteip", remoteIp);
  }
  const reply = await fetch(SITEVERIFY_URL, { method: "POST", body: form }).catch(() => null);
  const parsed = v.safeParse(SITEVERIFY_RESPONSE, await reply?.json().catch(() => null));
  return parsed.success && parsed.output.success;
}
