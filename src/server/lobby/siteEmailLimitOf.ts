import { configuredLimitOf } from "./configuredLimitOf";

const SITE_EMAILS_PER_DAY = 90;

export function siteEmailLimitOf(env: unknown): number {
  return configuredLimitOf(env, "TEST_SITE_EMAILS_PER_DAY", SITE_EMAILS_PER_DAY);
}
