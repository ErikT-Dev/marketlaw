import { configuredLimitOf } from "./configuredLimitOf";

const SITE_GAMES_PER_DAY = 50;

export function siteGameLimitOf(env: unknown): number {
  return configuredLimitOf(env, "TEST_SITE_GAMES_PER_DAY", SITE_GAMES_PER_DAY);
}
