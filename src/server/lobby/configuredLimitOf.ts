import * as v from "valibot";

const WHOLE_NUMBER_TEXT = v.pipe(v.string(), v.regex(/^[1-9][0-9]*$/u), v.transform(Number));

export function configuredLimitOf(env: unknown, variable: string, specLimit: number): number {
  const configured = v.safeParse(v.object({ [variable]: WHOLE_NUMBER_TEXT }), env);
  return configured.success ? (configured.output[variable] ?? specLimit) : specLimit;
}
