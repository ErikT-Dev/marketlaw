import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ChatIntent } from "./ChatIntent";
import type { ChatMessage } from "./ChatMessage";
import type { ConnectionState } from "./ConnectionState";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import { rejectMessage } from "./rejectMessage";
import { updateFor } from "./updateFor";

function chatMessageOf(intent: ChatIntent, sender: ChatMessage): ChatMessage | null {
  switch (intent.type) {
    case "send_chat":
      return { ...sender, text: intent.text };
    case "mute":
    case "unmute":
      return null;
  }
}

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
    chatMessage: chatMessageOf(intent, { from: playerId, name: sender.name, text: "", at: now }),
  };
}
