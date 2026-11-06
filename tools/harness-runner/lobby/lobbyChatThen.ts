import { chatListFor } from "../../../src/server/room/chatListFor.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import { chatTextsOf } from "./chatTextsOf.ts";
import type { LobbySession } from "./LobbySession.ts";

function viewChatOf(session: LobbySession, expected: unknown): unknown {
  const player =
    isRecord(expected) && typeof expected["player"] === "string" ? expected["player"] : "";
  const { record } = session;
  const entries =
    record === null
      ? []
      : chatListFor(record, session.chat.storage.messages(), session.identityNamed(player).playerId)
          .entries;
  return {
    player,
    messages: entries.flatMap((entry) =>
      entry.kind === "message" ? [{ from: entry.from, text: entry.text }] : [],
    ),
  };
}

export function lobbyChatThen(session: LobbySession, field: string, expected: unknown): unknown {
  switch (field) {
    case "chat":
      return session.chat.isDeleted() ? "deleted" : chatTextsOf(session.chat.storage.messages());
    case "notified":
      return [...session.chat.notified];
    case "view_chat":
      return viewChatOf(session, expected);
    default:
      return session.chat.isSavedBeforeShown;
  }
}
