import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { TutorialClientMessage } from "../../shared/protocol/TutorialClientMessage";
import type { ConnectionState } from "../room/ConnectionState";
import type { Identity } from "../room/Identity";
import { nextTutorialState } from "./nextTutorialState";
import type { TutorialInput } from "./TutorialInput";
import type { TutorialOutcome } from "./TutorialOutcome";
import type { TutorialRecord } from "./TutorialRecord";
import type { TutorialStorage } from "./TutorialStorage";
import { tutorialUpdateFor } from "./tutorialUpdateFor";

const REMEMBERED_ACTION_IDS = 20;

type VersionedMessage = Exclude<TutorialClientMessage, { readonly type: "resync" }>;

function rejected(
  connection: ConnectionState,
  code: ReasonCode,
  actionId: string | null,
): TutorialOutcome {
  return {
    kind: "open",
    connection,
    reply: {
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId,
      code,
      sendAgainAt: null,
    },
  };
}

function leave(storage: TutorialStorage): TutorialOutcome {
  storage.remove();
  return {
    kind: "closing",
    reply: { type: "removed", protocolVersion: PROTOCOL_VERSION, reason: "left", rejoinAt: null },
  };
}

function receiveVersioned(
  storage: TutorialStorage,
  record: TutorialRecord,
  message: VersionedMessage,
  input: TutorialInput,
): TutorialOutcome {
  const { connection, now } = input;
  const { actionId } = message;
  if (record.acceptedActionIds.includes(actionId)) {
    return { kind: "open", connection, reply: tutorialUpdateFor(record, actionId, now) };
  }
  if (message.stateVersion !== record.stateVersion) {
    return rejected(connection, "stale_state", actionId);
  }
  const { action } = message;
  if (action.type === "leave_tutorial") {
    return leave(storage);
  }
  const next = nextTutorialState(record.tutorial, action, now);
  if (!next.isOk) {
    return rejected(connection, next.error, actionId);
  }
  const accepted: TutorialRecord = {
    ...record,
    tutorial: next.value,
    stateVersion: record.stateVersion + 1,
    acceptedActionIds: [...record.acceptedActionIds, actionId].slice(-REMEMBERED_ACTION_IDS),
  };
  storage.write(accepted);
  return { kind: "open", connection, reply: tutorialUpdateFor(accepted, actionId, now) };
}

function receiveFrom(
  storage: TutorialStorage,
  sender: Identity,
  message: TutorialClientMessage,
  input: TutorialInput,
): TutorialOutcome {
  const record = storage.read();
  const actionId = message.type === "resync" ? null : message.actionId;
  if (record === undefined) {
    return { kind: "closing", reply: null };
  }
  if (record.player.playerId !== sender.playerId) {
    return rejected(input.connection, "not_in_game", actionId);
  }
  const connection = { ...input.connection, identity: sender };
  return message.type === "resync"
    ? { kind: "open", connection, reply: tutorialUpdateFor(record, null, input.now) }
    : receiveVersioned(storage, record, message, { ...input, connection });
}

export function receiveTutorialMessage(
  storage: TutorialStorage,
  input: TutorialInput,
): TutorialOutcome {
  const { parsed, sender, connection } = input;
  if (!parsed.isOk) {
    return rejected(connection, parsed.error, null);
  }
  if (sender === null) {
    const actionId = parsed.value.type === "resync" ? null : parsed.value.actionId;
    return rejected(connection, "invalid_token", actionId);
  }
  return receiveFrom(storage, sender, parsed.value, input);
}
