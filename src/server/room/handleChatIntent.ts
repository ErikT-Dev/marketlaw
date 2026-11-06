import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ChatIntent } from "./ChatIntent";
import type { ConnectionState } from "./ConnectionState";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import type { NewChatMessage } from "./NewChatMessage";
import { newChatMessageOf } from "./newChatMessageOf";
import { rejectMessage } from "./rejectMessage";
import type { Result } from "../../shared/Result";
import type { ChatRefusal } from "./ChatRefusal";
import { updateFor } from "./updateFor";

const NOTHING_SENT = { isOk: true, value: null } as const;

export function handleChatIntent(
  input: MessageInput,
  connection: ConnectionState,
  playerId: PlayerId,
  intent: ChatIntent,
): MessageOutcome {
  const { record, now } = input;
  const sender = record.players.find((player) => player.playerId === playerId);
  if (sender === undefined) {
    return rejectMessage(record, connection, { code: "not_in_room", actionId: null, now });
  }
  const sent: Result<NewChatMessage | null, ChatRefusal> =
    intent.type === "send_chat"
      ? newChatMessageOf(input.chat, {
          from: playerId,
          name: sender.name,
          text: intent.text,
          at: now,
        })
      : NOTHING_SENT;
  if (!sent.isOk) {
    const { code, sendAgainAt } = sent.error;
    const rejected = rejectMessage(record, connection, { code, actionId: null, now });
    const reply = {
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId: null,
      code,
      sendAgainAt,
    } as const;
    return { ...rejected, reply };
  }
  return {
    record,
    connection,
    shouldSave: false,
    reply: {
      type: "update",
      protocolVersion: PROTOCOL_VERSION,
      acceptedActionId: null,
      update: updateFor(record, playerId),
      serverNow: now,
    },
    playersToUpdate: [],
    shouldClose: false,
    removals: [],
    notices: [],
    chatMessage: sent.value,
  };
}
