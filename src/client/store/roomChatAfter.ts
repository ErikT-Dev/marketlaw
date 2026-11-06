import type { HostEvent } from "../../shared/HostEvent";
import type { ChatEntry } from "../../shared/protocol/ChatEntry";
import type { RoomChat } from "./RoomChat";

type ChatEvent = Extract<HostEvent, { readonly type: "chat" }>;

function othersMessageCount(entries: ReadonlyArray<ChatEntry>): number {
  return entries.filter((entry) => entry.kind === "message" && !entry.isOwn).length;
}

function newlyUnreadCount(chat: RoomChat, received: ChatEvent): number {
  if (!received.isFullList) {
    return othersMessageCount(received.entries);
  }
  if (chat.entries.length === 0) {
    return 0;
  }
  return Math.max(0, othersMessageCount(received.entries) - othersMessageCount(chat.entries));
}

export function roomChatAfter(chat: RoomChat, received: ChatEvent): RoomChat {
  return {
    entries: received.isFullList ? received.entries : [...chat.entries, ...received.entries],
    mutedNames: received.mutedNames,
    unreadCount: chat.unreadCount + newlyUnreadCount(chat, received),
  };
}
