import { configuredLimitOf } from "./configuredLimitOf";

const SITE_CHAT_MESSAGES_PER_DAY = 2000;

export function siteChatLimitOf(env: unknown): number {
  return configuredLimitOf(env, "TEST_SITE_CHAT_MESSAGES_PER_DAY", SITE_CHAT_MESSAGES_PER_DAY);
}
