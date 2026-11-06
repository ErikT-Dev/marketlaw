import type { ChatEntry } from "../../shared/protocol/ChatEntry";

export type RoomChat = {
  readonly entries: ReadonlyArray<ChatEntry>;
  readonly mutedNames: ReadonlyArray<string>;
  readonly unreadCount: number;
};
