import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { EpochMs } from "../../shared/EpochMs";
import { chatAfterMute } from "./chatAfterMute";
import type { ChatIntent } from "./ChatIntent";
import type { ConnectionState } from "./ConnectionState";
import type { Identity } from "./Identity";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import type { NewChatMessage } from "./NewChatMessage";
import { newChatMessageOf } from "./newChatMessageOf";
import { rejectMessage } from "./rejectMessage";
import type { RoomRecord } from "./RoomRecord";
import { updateFor } from "./updateFor";

function acceptedChat(
  input: MessageInput,
  accepted: { readonly record: RoomRecord; readonly playerId: PlayerId },
  chatMessage: NewChatMessage | null,
): MessageOutcome {
  const { record, playerId } = accepted;
  return {
    record,
    connection: input.connection,
    shouldSave: record !== input.record,
    reply: {
      type: "update",
      protocolVersion: PROTOCOL_VERSION,
      acceptedActionId: null,
      update: updateFor(record, playerId),
      serverNow: input.now,
    },
    playersToUpdate: [],
    shouldClose: false,
    removals: [],
    notices: [],
    chatMessage,
  };
}

function refusedChat(
  input: MessageInput,
  connection: ConnectionState,
  refusal: { readonly code: ReasonCode; readonly sendAgainAt: EpochMs | null },
): MessageOutcome {
  const { code, sendAgainAt } = refusal;
  const rejected = rejectMessage(input.record, connection, {
    code,
    actionId: null,
    now: input.now,
  });
  const reply = {
    type: "rejected",
    protocolVersion: PROTOCOL_VERSION,
    actionId: null,
    code,
    sendAgainAt,
  } as const;
  return { ...rejected, reply };
}

function sentChat(
  input: MessageInput,
  connection: ConnectionState,
  sender: Identity,
  text: string,
): MessageOutcome {
  const { record, now } = input;
  const hiddenFrom = record.chat.mutes
    .filter((mute) => mute.muted === sender.playerId)
    .map((mute) => mute.by);
  const sent = newChatMessageOf(input.chat, {
    from: sender.playerId,
    name: sender.name,
    text,
    at: now,
    hiddenFrom,
  });
  return sent.isOk
    ? acceptedChat({ ...input, connection }, { record, playerId: sender.playerId }, sent.value)
    : refusedChat(input, connection, sent.error);
}

export function handleChatIntent(
  input: MessageInput,
  connection: ConnectionState,
  playerId: PlayerId,
  intent: ChatIntent,
): MessageOutcome {
  const { record } = input;
  const sender = record.players.find((player) => player.playerId === playerId);
  if (sender === undefined) {
    return refusedChat(input, connection, { code: "not_in_room", sendAgainAt: null });
  }
  if (intent.type === "send_chat") {
    return sentChat(input, connection, sender, intent.text);
  }
  const chat = chatAfterMute(record, playerId, intent);
  if (!chat.isOk) {
    return refusedChat(input, connection, { code: chat.error, sendAgainAt: null });
  }
  const next = chat.value === record.chat ? record : { ...record, chat: chat.value };
  return acceptedChat({ ...input, connection }, { record: next, playerId }, null);
}
