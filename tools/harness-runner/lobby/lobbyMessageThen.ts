import { noticeToastOf } from "../../../src/client/screens/game/noticeToastOf.ts";
import { REJECTION_MESSAGES } from "../../../src/client/screens/game/REJECTION_MESSAGES.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { IconText } from "../../../src/client/components/IconText.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

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

function textShownFrom(messages: ReadonlyArray<ServerMessage>, expected: unknown): unknown {
  const texts = messages.flatMap(shownTextOf);
  return texts.includes(String(expected)) ? expected : (texts.at(-1) ?? null);
}

export function lobbyMessageThen(
  messagesTo: ReadonlyMap<string, ReadonlyArray<ServerMessage>>,
  expected: unknown,
): unknown {
  const asked = isRecord(expected) ? expected : {};
  const player = typeof asked["player"] === "string" ? asked["player"] : "";
  const contains: ReadonlyArray<unknown> = Array.isArray(asked["contains"])
    ? asked["contains"]
    : [];
  const messages = messagesTo.get(player) ?? [];
  const accepted = acceptedNamesIn(messages);
  return {
    player,
    text: textShownFrom(messages, asked["text"]),
    contains: contains.map((entry) =>
      isRecord(entry) && "accepted" in entry ? { accepted } : undefined,
    ),
  };
}
