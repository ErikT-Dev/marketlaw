import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { ConnectionState } from "./ConnectionState";
import { handleChatIntent } from "./handleChatIntent";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import type { RoomActionChange } from "./RoomActionChange";
import { rejectMessage } from "./rejectMessage";
import { roomActionOutcome } from "./roomActionOutcome";
import { updateFor } from "./updateFor";

function replyTo(playerId: PlayerId, change: RoomActionChange, input: MessageInput): ServerMessage {
  const next = change.record;
  const ownRemoval = change.removals.find((removal) => removal.playerId === playerId);
  if (next === null || !next.players.some((player) => player.playerId === playerId)) {
    return {
      type: "removed",
      protocolVersion: PROTOCOL_VERSION,
      reason: ownRemoval?.reason ?? "left",
      rejoinAt: ownRemoval?.rejoinAt ?? null,
    };
  }
  if (change.refusal !== null) {
    return {
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId: null,
      code: change.refusal,
      sendAgainAt: null,
    };
  }
  return {
    type: "update",
    protocolVersion: PROTOCOL_VERSION,
    acceptedActionId: null,
    update: updateFor(next, playerId),
    serverNow: input.now,
  };
}

export function handleRoomMessage(
  input: MessageInput,
  connection: ConnectionState,
  playerId: PlayerId,
  intent: RoomIntent,
): MessageOutcome {
  if (intent.type === "send_chat" || intent.type === "mute" || intent.type === "unmute") {
    return handleChatIntent(input, connection, playerId, intent);
  }
  const { record, now, gameStart } = input;
  const outcome = roomActionOutcome(record, playerId, intent, gameStart);
  if (!outcome.isOk) {
    return rejectMessage(record, connection, { code: outcome.error, actionId: null, now });
  }
  const change = outcome.value;
  const next = change.record;
  const isSenderUpdated = change.refusal !== null;
  return {
    record: next,
    connection,
    shouldSave: next !== record,
    reply: replyTo(playerId, change, input),
    playersToUpdate:
      next === null || next === record
        ? []
        : next.players
            .map((player) => player.playerId)
            .filter((id) => isSenderUpdated || id !== playerId),
    shouldClose: false,
    removals: change.removals.filter((removal) => removal.playerId !== playerId),
    notices: change.notices.filter((addressed) => addressed.playerId !== playerId),
    chatMessage: null,
  };
}
