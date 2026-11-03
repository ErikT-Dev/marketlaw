import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

function acceptedNamesIn(messages: ReadonlyArray<ServerMessage>): ReadonlyArray<string> | null {
  const update = [...messages].reverse().find((message) => message.type === "update");
  return update?.type === "update" ? (update.update.room.asking?.acceptedNames ?? null) : null;
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
  const accepted = acceptedNamesIn(messagesTo.get(player) ?? []);
  return {
    player,
    contains: contains.map((entry) =>
      isRecord(entry) && "accepted" in entry ? { accepted } : undefined,
    ),
  };
}
