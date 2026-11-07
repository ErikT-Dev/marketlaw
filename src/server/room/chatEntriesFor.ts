import type { PlayerId } from "../../shared/PlayerId";
import type { ChatEntry } from "../../shared/protocol/ChatEntry";
import type { ChatMessage } from "./ChatMessage";
import type { ChatSince } from "./ChatSince";
import type { RoomRecord } from "./RoomRecord";

const LINE_FIRST = 0;
const MESSAGE_AFTER_LINES = 1;

export function chatEntriesFor(
  record: RoomRecord,
  messages: ReadonlyArray<ChatMessage>,
  playerId: PlayerId,
  since: ChatSince,
): ReadonlyArray<ChatEntry> {
  const reader = record.chat.readers.find((candidate) => candidate.playerId === playerId);
  if (reader === undefined) {
    return [];
  }
  const messageFrom = Math.max(reader.messageFrom, since.messages);
  const lineFrom = Math.max(reader.lineFrom, since.lines);
  const firstLineNumber = record.chat.lineCount - record.chat.lines.length;
  const lines = record.chat.lines
    .filter((line, index) => firstLineNumber + index >= lineFrom)
    .map(({ position, entry }) => ({ position, rank: LINE_FIRST, entry }));
  const shown = messages
    .map((message, position) => ({ message, position }))
    .slice(messageFrom)
    .filter(({ message }) => !message.hiddenFrom.includes(playerId))
    .map(({ message, position }) => ({
      position,
      rank: MESSAGE_AFTER_LINES,
      entry: {
        kind: "message" as const,
        from: message.name,
        text: message.text,
        at: message.at,
        isOwn: message.from === playerId,
      },
    }));
  return [...lines, ...shown]
    .sort((first, second) => first.position - second.position || first.rank - second.rank)
    .map(({ entry }) => entry);
}
