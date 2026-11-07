import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";
import { CHAT_LIMIT_CODES } from "./CHAT_LIMIT_CODES";
import type { ChatLimitCode } from "./ChatLimitCode";
import type { RoomChat } from "./RoomChat";

function isChatLimitCode(code: ReasonCode): code is ChatLimitCode {
  return CHAT_LIMIT_CODES.some((limitCode) => limitCode === code);
}

export function chatAfterRefusal(
  chat: RoomChat,
  code: ReasonCode,
  sendAgainAt: EpochMs | null,
): RoomChat | null {
  if (!isChatLimitCode(code)) {
    return null;
  }
  const [text = "", ...stillUnanswered] = chat.unansweredTexts;
  return { ...chat, unansweredTexts: stillUnanswered, refused: { code, sendAgainAt, text } };
}
