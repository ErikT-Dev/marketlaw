import type { RoomChat } from "./RoomChat";

export function chatAfterSending(chat: RoomChat, text: string): RoomChat {
  return { ...chat, unansweredTexts: [...chat.unansweredTexts, text], refused: null };
}
