import { noticeToastOf } from "../../../src/client/screens/game/noticeToastOf.ts";
import { REJECTION_MESSAGES } from "../../../src/client/screens/game/REJECTION_MESSAGES.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { IconText } from "../../../src/client/components/IconText.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { QueueSent } from "./QueueSent.ts";

function acceptedNamesIn(messages: ReadonlyArray<ServerMessage>): ReadonlyArray<string> | null {
  const update = [...messages].reverse().find((message) => message.type === "update");
  return update?.type === "update" ? (update.update.room.asking?.acceptedNames ?? null) : null;
}

function wordsOf(text: IconText): string {
  return typeof text === "string"
    ? text
    : text.map((part) => (typeof part === "string" ? part : `[${JSON.stringify(part)}]`)).join("");
}

function shownTextOf(message: ServerMessage): ReadonlyArray<string> {
  if (message.type === "rejected") {
    return [wordsOf(REJECTION_MESSAGES[message.code])];
  }
  return message.type === "notice" ? [wordsOf(noticeToastOf(message.notice, 1, []).text)] : [];
}

function queueTextsOf(queue: QueueSent): ReadonlyArray<string> {
  const isHeldBack = queue.view.isSiteGameLimitReached && queue.view.own.kind !== "out";
  return isHeldBack ? [wordsOf(REJECTION_MESSAGES.site_game_limit)] : [];
}

function textShownFrom(
  messages: ReadonlyArray<ServerMessage>,
  queue: QueueSent,
  expected: unknown,
): unknown {
  const texts = [...messages.flatMap(shownTextOf), ...queueTextsOf(queue)];
  return texts.includes(String(expected)) ? expected : (texts.at(-1) ?? null);
}

function stringValuesOf(value: unknown): ReadonlyArray<string> {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(stringValuesOf);
  }
  return isRecord(value) ? Object.values(value).flatMap(stringValuesOf) : [];
}

function noticeShownFrom(
  messages: ReadonlyArray<ServerMessage>,
  pageNotice: string | undefined,
  queue: QueueSent,
  expected: unknown,
): string | null {
  const notices = [
    ...messages.flatMap((message) => (message.type === "notice" ? [message.notice.kind] : [])),
    ...queue.notices.map(({ kind }) => kind),
    ...(pageNotice === undefined ? [] : [pageNotice]),
  ];
  return notices.find((notice) => notice === expected) ?? notices.at(-1) ?? null;
}

function isHiddenIn(word: unknown, queue: QueueSent, sentText: string): boolean {
  if (word === "queue_members") {
    const queueText = JSON.stringify([queue.notices, queue.view]);
    return queue.memberIds.every((memberId) => !queueText.includes(memberId));
  }
  return typeof word === "string" && !sentText.includes(word);
}

export function lobbyMessageThen(
  messagesTo: ReadonlyMap<string, ReadonlyArray<ServerMessage>>,
  expected: unknown,
  pageNoticesTo: ReadonlyMap<string, string>,
  queueSentTo: (player: string) => QueueSent,
): unknown {
  const asked = isRecord(expected) ? expected : {};
  const player = typeof asked["player"] === "string" ? asked["player"] : "";
  const contains: ReadonlyArray<unknown> = Array.isArray(asked["contains"])
    ? asked["contains"]
    : [];
  const messages = messagesTo.get(player) ?? [];
  const accepted = acceptedNamesIn(messages);
  const queue = queueSentTo(player);
  const queueText = JSON.stringify([queue.notices, queue.view]);
  const sentText = `${stringValuesOf(messages).join(" ")} ${queueText}`;
  const hides: ReadonlyArray<unknown> = Array.isArray(asked["hides"]) ? asked["hides"] : [];
  return {
    player,
    text: textShownFrom(messages, queue, asked["text"]),
    notice: noticeShownFrom(messages, pageNoticesTo.get(player), queue, asked["notice"]),
    size: queue.notices
      .flatMap((notice) => (notice.kind === "match_found" ? [notice.size] : []))
      .at(-1),
    hides: hides.filter((word) => isHiddenIn(word, queue, sentText)),
    contains: contains.map((entry) =>
      isRecord(entry) && "accepted" in entry ? { accepted } : undefined,
    ),
  };
}
