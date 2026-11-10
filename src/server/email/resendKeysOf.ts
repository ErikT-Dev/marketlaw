import * as v from "valibot";

const RESEND_ENV = v.object({
  RESEND_API_KEY: v.pipe(v.string(), v.minLength(1)),
  EMAIL_FROM: v.pipe(v.string(), v.minLength(1)),
});

export function resendKeysOf(
  env: unknown,
): { readonly apiKey: string; readonly from: string } | null {
  const parsed = v.safeParse(RESEND_ENV, env);
  return parsed.success
    ? { apiKey: parsed.output.RESEND_API_KEY, from: parsed.output.EMAIL_FROM }
    : null;
}
