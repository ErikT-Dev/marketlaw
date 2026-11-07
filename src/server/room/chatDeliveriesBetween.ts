import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ChatDelivery } from "./ChatDelivery";
import { chatEntriesFor } from "./chatEntriesFor";
import type { ChatMessage } from "./ChatMessage";
import { mutedNamesOf } from "./mutedNamesOf";
import type { RoomRecord } from "./RoomRecord";

function isSameList(first: ReadonlyArray<string>, second: ReadonlyArray<string>): boolean {
  return first.length === second.length && first.every((name, index) => name === second[index]);
}

export function chatDeliveriesBetween(
  before: { readonly record: RoomRecord | null; readonly messageCount: number },
  after: RoomRecord | null,
  messages: ReadonlyArray<ChatMessage>,
): ReadonlyArray<ChatDelivery> {
  if (after === null) {
    return [];
  }
  const recordBefore = before.record?.code === after.code ? before.record : null;
  const since = { messages: before.messageCount, lines: recordBefore?.chat.lineCount ?? 0 };
  return after.players.flatMap(({ playerId }) => {
    const entries = chatEntriesFor(after, messages, playerId, since);
    const mutedNames = mutedNamesOf(after.chat, playerId);
    const mutedBefore = recordBefore === null ? [] : mutedNamesOf(recordBefore.chat, playerId);
    return entries.length === 0 && isSameList(mutedNames, mutedBefore)
      ? []
      : [
          {
            playerId,
            message: {
              type: "chat" as const,
              protocolVersion: PROTOCOL_VERSION,
              entries,
              mutedNames,
              isFullList: false,
            },
          },
        ];
  });
}
