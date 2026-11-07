import { receiveAction } from "../../rules/receiveAction";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ClientMessage } from "../../shared/protocol/ClientMessage";
import type { ReasonCode } from "../../shared/ReasonCode";
import { acceptAction } from "./acceptAction";
import type { ConnectionState } from "./ConnectionState";
import { gameActionOf } from "./gameActionOf";
import type { MessageInput } from "./MessageInput";
import type { MessageOutcome } from "./MessageOutcome";
import type { RoomRecord } from "./RoomRecord";
import { handleRoomMessage } from "./handleRoomMessage";
import { rejectMessage } from "./rejectMessage";
import { playersWhoseUpdateChanged } from "./playersWhoseUpdateChanged";
import { updateFor } from "./updateFor";
import { withTimeOutsApplied } from "./withTimeOutsApplied";

type ActionMessage = Extract<ClientMessage, { readonly type: "action" }>;

function updated(
  record: RoomRecord,
  connection: ConnectionState,
  playerId: PlayerId,
  reply: { readonly acceptedActionId: string | null; readonly now: EpochMs },
): MessageOutcome {
  return {
    record,
    connection,
    shouldSave: false,
    reply: {
      type: "update",
      protocolVersion: PROTOCOL_VERSION,
      acceptedActionId: reply.acceptedActionId,
      update: updateFor(record, playerId),
      serverNow: reply.now,
    },
    playersToUpdate: [],
    shouldClose: false,
    removals: [],
    notices: [],
    chatMessage: null,
  };
}

function handleAction(
  input: MessageInput,
  connection: ConnectionState,
  playerId: PlayerId,
  message: ActionMessage,
): MessageOutcome {
  const { record, now, randomFor } = input;
  function reject(code: ReasonCode): MessageOutcome {
    return rejectMessage(record, connection, { code, actionId: message.actionId, now });
  }
  const seat = record.game?.seats.find((candidate) => candidate.playerId === playerId);
  if (record.game === null || seat === undefined) {
    return reject(
      record.players.some((player) => player.playerId === playerId) ? "wrong_phase" : "not_in_game",
    );
  }
  if (seat.acceptedActionIds.includes(message.actionId)) {
    return updated(record, connection, playerId, { acceptedActionId: message.actionId, now });
  }
  if (message.stateVersion !== seat.stateVersion) {
    return reject("stale_state");
  }
  const action = gameActionOf(seat.seat, message.action);
  if (action === undefined) {
    return reject("malformed_message");
  }
  const received = receiveAction(record.game.saved, action, now, randomFor);
  const caughtUp = { ...record, game: withTimeOutsApplied(record.game, received.caughtUp) };
  if (received.rejection !== null) {
    return {
      ...rejectMessage(caughtUp, connection, {
        code: received.rejection.code,
        actionId: message.actionId,
        now,
      }),
      shouldSave: caughtUp.game !== record.game,
      playersToUpdate: playersWhoseUpdateChanged(record, caughtUp),
    };
  }
  const game = acceptAction(
    caughtUp.game,
    { seat: seat.seat, actionId: message.actionId },
    received.saved,
  );
  const next = { ...record, game };
  return {
    ...updated(next, connection, playerId, { acceptedActionId: message.actionId, now }),
    shouldSave: true,
    playersToUpdate: playersWhoseUpdateChanged(record, next),
  };
}

export function handleMessage(input: MessageInput): MessageOutcome {
  const { record, connection, parsed, sender, now } = input;
  if (!parsed.isOk) {
    return rejectMessage(record, connection, { code: parsed.error, actionId: null, now });
  }
  const message = parsed.value;
  const actionId = message.type === "action" ? message.actionId : null;
  const isOtherPlayer =
    connection.identity !== null && connection.identity.playerId !== sender?.playerId;
  if (sender === null || isOtherPlayer) {
    return rejectMessage(record, connection, { code: "invalid_token", actionId, now });
  }
  const bound = { ...connection, identity: sender };
  if (message.type === "action") {
    return handleAction(input, bound, sender.playerId, message);
  }
  if (message.type === "room") {
    return handleRoomMessage(input, bound, sender.playerId, message.action);
  }
  if (!record.players.some((player) => player.playerId === sender.playerId)) {
    return rejectMessage(record, connection, { code: "not_in_game", actionId: null, now });
  }
  return updated(record, bound, sender.playerId, { acceptedActionId: null, now });
}
