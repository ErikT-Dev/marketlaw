import type { ChatMessage } from "./ChatMessage";
import type { ChatQuota } from "./ChatQuota";

export type NewChatMessage = {
  readonly message: ChatMessage;
  readonly quota: ChatQuota;
};
