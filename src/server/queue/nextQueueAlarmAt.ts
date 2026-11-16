import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import { DAY_MS } from "../lobby/DAY_MS";
import { dayOf } from "../lobby/dayOf";
import { isSiteGameLimitReached } from "./isSiteGameLimitReached";
import type { QueueContext } from "./QueueContext";
import type { QueueState } from "./QueueState";
import { QUEUE_TIMES } from "./QUEUE_TIMES";

export function nextQueueAlarmAt(state: QueueState, context: QueueContext): EpochMs | null {
  const { queue } = state;
  const isHeldBack = queue.entries.length > 0 && isSiteGameLimitReached(state.lobby, context);
  const closedLeaves = queue.closedConnections
    .filter(({ playerId }) => queue.entries.some((entry) => entry.playerId === playerId))
    .map(({ since }) => since + QUEUE_TIMES.closedConnectionLeaveMs);
  const times = [
    ...queue.matches.map(({ deadline }) => deadline),
    ...closedLeaves,
    ...(isHeldBack ? [(dayOf(context.now) + 1) * DAY_MS] : []),
  ];
  return times.length === 0 ? null : v.parse(EpochMs, Math.min(...times));
}
