import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ChatDelivery } from "./ChatDelivery";
import { chatEntriesFor } from "./chatEntriesFor";
import type { ChatMessage } from "./ChatMessage";
import type { RoomRecord } from "./RoomRecord";

export function chatDeliveriesBetween(
  before: { readonly record: RoomRecord | null; readonly messageCount: number },
  after: RoomRecord | null,
  messages: ReadonlyArray<ChatMessage>,
): ReadonlyArray<ChatDelivery> {
  if (after === null) {
    return [];
  }
  const since = {
    messages: before.messageCount,
    lines: before.record?.code === after.code ? before.record.chat.lineCount : 0,
  };
  return after.players.flatMap(({ playerId }) => {
    const entries = chatEntriesFor(after, messages, playerId, since);
    return entries.length === 0
      ? []
      : [
          {
            playerId,
            message: {
              type: "chat" as const,
              protocolVersion: PROTOCOL_VERSION,
              entries,
              isFullList: false,
            },
          },
        ];
  });
}
