import type { ChatMessage } from "../../../src/server/room/ChatMessage.ts";

export function chatTextsOf(
  messages: ReadonlyArray<ChatMessage>,
): ReadonlyArray<{ readonly from: string; readonly text: string }> {
  return messages.map(({ name, text }) => ({ from: name, text }));
}
