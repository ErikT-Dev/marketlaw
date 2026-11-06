import * as v from "valibot";
import { CHAT_TEXT_LIMITS } from "../../shared/CHAT_TEXT_LIMITS";
import { EpochMs } from "../../shared/EpochMs";
import { measureChatText } from "../../shared/measureChatText";
import type { Result } from "../../shared/Result";
import { dayOf } from "../lobby/dayOf";
import type { ChatContext } from "./ChatContext";
import type { ChatMessage } from "./ChatMessage";
import type { ChatQuota } from "./ChatQuota";
import type { ChatRefusal } from "./ChatRefusal";
import type { NewChatMessage } from "./NewChatMessage";

const MESSAGE_GAP_MS = 2000;
const MESSAGES_PER_PLAYER_IN_ROOM = 100;

function refused(code: ChatRefusal["code"], sendAgainAt: EpochMs | null = null) {
  return { isOk: false, error: { code, sendAgainAt } } as const;
}

function textRefusal(text: string): ChatRefusal | null {
  const measured = measureChatText(text);
  if (measured.characterCount === 0) {
    return { code: "message_empty", sendAgainAt: null };
  }
  const isTooLong =
    measured.characterCount > CHAT_TEXT_LIMITS.maxCharacters ||
    measured.byteCount > CHAT_TEXT_LIMITS.maxBytes;
  return isTooLong ? { code: "message_too_long", sendAgainAt: null } : null;
}

function quotaAfterOne(chat: ChatContext, now: EpochMs): Result<ChatQuota, ChatRefusal> {
  const day = dayOf(now);
  if (chat.quota.day === day && chat.quota.left > 0) {
    return { isOk: true, value: { day, left: chat.quota.left - 1 } };
  }
  const grant = chat.grantQuota();
  if (grant.kind === "no_answer") {
    return refused("no_answer");
  }
  return grant.count > 0
    ? { isOk: true, value: { day, left: grant.count - 1 } }
    : refused("site_daily_cap");
}

export function newChatMessageOf(
  chat: ChatContext,
  typed: ChatMessage,
): Result<NewChatMessage, ChatRefusal> {
  const rejection = textRefusal(typed.text);
  if (rejection !== null) {
    return { isOk: false, error: rejection };
  }
  const own = chat.messages.filter((message) => message.from === typed.from);
  if (own.length >= MESSAGES_PER_PLAYER_IN_ROOM) {
    return refused("chat_room_limit");
  }
  const last = own.at(-1);
  if (last !== undefined && typed.at - last.at < MESSAGE_GAP_MS) {
    return refused("chat_too_fast", v.parse(EpochMs, last.at + MESSAGE_GAP_MS));
  }
  const quota = quotaAfterOne(chat, typed.at);
  if (!quota.isOk) {
    return quota;
  }
  return {
    isOk: true,
    value: { message: { ...typed, text: measureChatText(typed.text).text }, quota: quota.value },
  };
}
