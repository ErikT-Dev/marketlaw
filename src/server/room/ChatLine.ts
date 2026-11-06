import type { ChatLineEntry } from "../../shared/protocol/ChatLineEntry";

export type ChatLine = {
  readonly position: number;
  readonly entry: ChatLineEntry;
};
