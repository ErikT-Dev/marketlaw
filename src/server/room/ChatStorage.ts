import type { ChatMessage } from "./ChatMessage";

export type ChatStorage = {
  readonly messages: () => ReadonlyArray<ChatMessage>;
  readonly append: (message: ChatMessage) => void;
};
