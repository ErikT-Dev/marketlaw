import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ChatDelivery } from "./ChatDelivery";
import { chatEntriesFor } from "./chatEntriesFor";
import type { ChatMessage } from "./ChatMessage";
import { mutedNamesOf } from "./mutedNamesOf";
import type { RoomRecord } from "./RoomRecord";

export function chatListFor(
  record: RoomRecord,
  messages: ReadonlyArray<ChatMessage>,
  playerId: PlayerId,
): ChatDelivery["message"] {
  return {
    type: "chat",
    protocolVersion: PROTOCOL_VERSION,
    entries: chatEntriesFor(record, messages, playerId, { messages: 0, lines: 0 }),
    mutedNames: mutedNamesOf(record.chat, playerId),
    isFullList: true,
  };
}
