import type { RefusedChatMessage } from "../../store/RefusedChatMessage";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";

function secondsText(seconds: number): string {
  return seconds === 1 ? "1 second" : `${String(seconds)} seconds`;
}

export function chatLimitText(refused: RefusedChatMessage, serverNow: number): string | null {
  const text = REJECTION_MESSAGES[refused.code];
  const limitText = typeof text === "string" ? text : "";
  if (refused.sendAgainAt === null) {
    return limitText;
  }
  const secondsLeft = Math.ceil((refused.sendAgainAt - serverNow) / 1000);
  return secondsLeft > 0 ? `${limitText} Try again in ${secondsText(secondsLeft)}.` : null;
}
