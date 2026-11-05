import * as v from "valibot";

const SITE_GAMES_PER_DAY = 50;

const TEST_SITE_LIMIT_ENV = v.object({
  TEST_SITE_GAMES_PER_DAY: v.pipe(v.string(), v.regex(/^[1-9][0-9]*$/u), v.transform(Number)),
});

export function siteGameLimitOf(env: unknown): number {
  const configured = v.safeParse(TEST_SITE_LIMIT_ENV, env);
  return configured.success ? configured.output.TEST_SITE_GAMES_PER_DAY : SITE_GAMES_PER_DAY;
}
