import * as v from "valibot";

const HUMAN_CHECK_ENV = v.object({
  TURNSTILE_SITE_KEY: v.pipe(v.string(), v.minLength(1)),
  TURNSTILE_SECRET_KEY: v.pipe(v.string(), v.minLength(1)),
});

export function humanCheckKeysOf(
  env: unknown,
): { readonly siteKey: string; readonly secretKey: string } | null {
  const parsed = v.safeParse(HUMAN_CHECK_ENV, env);
  return parsed.success
    ? { siteKey: parsed.output.TURNSTILE_SITE_KEY, secretKey: parsed.output.TURNSTILE_SECRET_KEY }
    : null;
}
