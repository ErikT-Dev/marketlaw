import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueMatch } from "./QueueMatch";
import type { QueueState } from "./QueueState";
import { QUEUE_TIMES } from "./QUEUE_TIMES";
import { rematched } from "./rematched";
import { withMatchUndone } from "./withMatchUndone";

function withMatchExpired(change: QueueChange, match: QueueMatch): QueueChange {
  const rejoinAt = v.parse(EpochMs, match.deadline + QUEUE_TIMES.rejoinWaitMs);
  const leaving = match.players
    .filter(({ playerId }) => !match.confirmed.includes(playerId))
    .map(({ playerId }) => ({
      playerId,
      notice: { kind: "match_missed" as const, rejoinAt },
      rejoinAt,
    }));
  return withMatchUndone(change, match, leaving, {
    kind: "match_not_started",
    reason: "not_confirmed",
  });
}

export function fireQueueAlarm(state: QueueState, context: QueueContext): QueueChange {
  const { queue } = state;
  const expired = queue.matches.filter(({ deadline }) => deadline <= context.now);
  const undone = expired.reduceRight(withMatchExpired, {
    ...state,
    queue: {
      ...queue,
      rejoinWaits: queue.rejoinWaits.filter(({ until }) => until > context.now),
    },
    notices: [],
    starts: [],
  });
  return rematched(undone, context);
}
