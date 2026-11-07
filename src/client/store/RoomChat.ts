import type { ChatEntry } from "../../shared/protocol/ChatEntry";
import type { RefusedChatMessage } from "./RefusedChatMessage";

export type RoomChat = {
  readonly entries: ReadonlyArray<ChatEntry>;
  readonly mutedNames: ReadonlyArray<string>;
  readonly unreadCount: number;
  readonly unansweredTexts: ReadonlyArray<string>;
  readonly refused: RefusedChatMessage | null;
};
