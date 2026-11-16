import type { Result } from "../../shared/Result";
import { changeQueueSizes } from "./changeQueueSizes";
import { confirmMatch } from "./confirmMatch";
import { declineMatch } from "./declineMatch";
import { fireQueueAlarm } from "./fireQueueAlarm";
import { joinQueue } from "./joinQueue";
import { leaveQueue } from "./leaveQueue";
import { nextQueueAlarmAt } from "./nextQueueAlarmAt";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueOperation } from "./QueueOperation";
import type { QueueOutcome } from "./QueueOutcome";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";
import { withQueueConnection } from "./withQueueConnection";

function operationOn(
  state: QueueState,
  operation: QueueOperation,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  switch (operation.kind) {
    case "join":
      return joinQueue(state, operation.joiner, operation.sizes, context);
    case "change_sizes":
      return changeQueueSizes(state, operation.playerId, operation.sizes, context);
    case "leave":
      return leaveQueue(state, operation.playerId, context);
    case "confirm":
      return confirmMatch(state, operation.playerId, context);
    case "decline":
      return declineMatch(state, operation.playerId, context);
    case "connection": {
      const queue = withQueueConnection(state.queue, operation.playerId, {
        isConnected: operation.isConnected,
        at: context.now,
      });
      return { isOk: true, value: { ...state, queue, notices: [], starts: [] } };
    }
    case "alarm":
      return { isOk: true, value: { ...state, notices: [], starts: [] } };
  }
}

function withAlarmFiredIfDue(
  state: QueueState,
  operation: QueueOperation,
  context: QueueContext,
): QueueChange {
  const due = nextQueueAlarmAt(state, context);
  const isDue = operation.kind === "alarm" || (due !== null && due <= context.now);
  return isDue ? fireQueueAlarm(state, context) : { ...state, notices: [], starts: [] };
}

export function applyQueueOperation(
  state: QueueState,
  operation: QueueOperation,
  context: QueueContext,
): QueueOutcome {
  const fired = withAlarmFiredIfDue(state, operation, context);
  const applied = operationOn({ queue: fired.queue, lobby: fired.lobby }, operation, context);
  if (!applied.isOk) {
    return { change: fired, rejection: applied.error };
  }
  return {
    change: {
      ...applied.value,
      notices: [...fired.notices, ...applied.value.notices],
      starts: [...fired.starts, ...applied.value.starts],
    },
    rejection: null,
  };
}
