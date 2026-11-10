import * as v from "valibot";

const BREVO_ENV = v.object({
  BREVO_API_KEY: v.pipe(v.string(), v.minLength(1)),
  EMAIL_FROM: v.pipe(v.string(), v.minLength(1)),
});

export function brevoKeysOf(
  env: unknown,
): { readonly apiKey: string; readonly from: string } | null {
  const parsed = v.safeParse(BREVO_ENV, env);
  return parsed.success
    ? { apiKey: parsed.output.BREVO_API_KEY, from: parsed.output.EMAIL_FROM }
    : null;
}
