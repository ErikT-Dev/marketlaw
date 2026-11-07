import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";
import { CHAT_REFUSAL_CODES } from "./CHAT_REFUSAL_CODES";
import type { ChatRefusalCode } from "./ChatRefusalCode";
import type { RoomChat } from "./RoomChat";

const CODES_OTHER_ROOM_ACTIONS_GET_TOO: ReadonlyArray<ChatRefusalCode> = [
  "not_in_room",
  "no_answer",
];

function isChatRefusalCode(code: ReasonCode): code is ChatRefusalCode {
  return CHAT_REFUSAL_CODES.some((refusalCode) => refusalCode === code);
}

export function chatAfterRefusal(
  chat: RoomChat,
  code: ReasonCode,
  sendAgainAt: EpochMs | null,
): RoomChat | null {
  const [oldestText, ...stillUnanswered] = chat.unansweredTexts;
  if (!isChatRefusalCode(code)) {
    return null;
  }
  if (oldestText === undefined && CODES_OTHER_ROOM_ACTIONS_GET_TOO.includes(code)) {
    return null;
  }
  const text = oldestText ?? "";
  return { ...chat, unansweredTexts: stillUnanswered, refused: { code, sendAgainAt, text } };
}
