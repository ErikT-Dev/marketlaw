import type { ChatContext } from "./ChatContext";
import { NO_CHAT_QUOTA } from "./NO_CHAT_QUOTA";

export const NO_CHAT_CONTEXT: ChatContext = {
  messages: [],
  quota: NO_CHAT_QUOTA,
  grantQuota: () => ({ kind: "no_answer" }),
};
