import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import { DAY_MS } from "../lobby/DAY_MS";
import { dayOf } from "../lobby/dayOf";
import { isSiteGameLimitReached } from "./isSiteGameLimitReached";
import type { QueueContext } from "./QueueContext";
import type { QueueState } from "./QueueState";

export function nextQueueAlarmAt(state: QueueState, context: QueueContext): EpochMs | null {
  const isHeldBack = state.queue.entries.length > 0 && isSiteGameLimitReached(state.lobby, context);
  return isHeldBack ? v.parse(EpochMs, (dayOf(context.now) + 1) * DAY_MS) : null;
}
