import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ConnectionState } from "./ConnectionState";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import { rejectMessage } from "./rejectMessage";
import { roomActionOutcome } from "./roomActionOutcome";
import { updateFor } from "./updateFor";

export function handleRoomMessage(
  input: MessageInput,
  connection: ConnectionState,
  playerId: PlayerId,
  intent: RoomIntent,
): MessageOutcome {
  const { record, now, gameStart } = input;
  const outcome = roomActionOutcome(record, playerId, intent, gameStart);
  if (!outcome.isOk) {
    return rejectMessage(record, connection, { code: outcome.error, actionId: null, now });
  }
  const next = outcome.value.record;
  const isStillIn = next?.players.some((player) => player.playerId === playerId) === true;
  const ownRemoval = outcome.value.removals.find((removal) => removal.playerId === playerId);
  return {
    record: next,
    connection,
    shouldSave: next !== record,
    reply:
      next !== null && isStillIn
        ? {
            type: "update",
            protocolVersion: PROTOCOL_VERSION,
            acceptedActionId: null,
            update: updateFor(next, playerId),
            serverNow: now,
          }
        : {
            type: "removed",
            protocolVersion: PROTOCOL_VERSION,
            reason: ownRemoval?.reason ?? "left",
            rejoinAt: ownRemoval?.rejoinAt ?? null,
          },
    playersToUpdate:
      next === null || next === record
        ? []
        : next.players.map((player) => player.playerId).filter((id) => id !== playerId),
    shouldClose: false,
  };
}
