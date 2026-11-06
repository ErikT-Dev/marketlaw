import type { ChatMessage } from "./ChatMessage";
import type { ChatQuota } from "./ChatQuota";
import type { NewChatMessage } from "./NewChatMessage";

export type ChatStorage = {
  readonly messages: () => ReadonlyArray<ChatMessage>;
  readonly quota: () => ChatQuota;
  readonly append: (newMessage: NewChatMessage) => void;
};
