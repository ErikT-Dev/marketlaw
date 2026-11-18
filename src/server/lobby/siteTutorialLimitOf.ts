import { configuredLimitOf } from "./configuredLimitOf";

const SITE_TUTORIALS_PER_DAY = 100;

export function siteTutorialLimitOf(env: unknown): number {
  return configuredLimitOf(env, "TEST_SITE_TUTORIALS_PER_DAY", SITE_TUTORIALS_PER_DAY);
}
