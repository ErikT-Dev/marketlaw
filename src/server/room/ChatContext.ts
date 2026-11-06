import type { ChatMessage } from "./ChatMessage";
import type { ChatQuota } from "./ChatQuota";
import type { ChatQuotaGrant } from "./ChatQuotaGrant";

export type ChatContext = {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly quota: ChatQuota;
  readonly grantQuota: () => ChatQuotaGrant;
};
