import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { openMatchOf } from "./openMatchOf";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";
import { QUEUE_TIMES } from "./QUEUE_TIMES";
import { rematched } from "./rematched";
import { withMatchUndone } from "./withMatchUndone";

export function declineMatch(
  state: QueueState,
  playerId: PlayerId,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  const match = openMatchOf(state.queue, playerId, context.now);
  if (match === undefined) {
    return { isOk: false, error: "no_match_to_confirm" };
  }
  const rejoinAt = v.parse(EpochMs, context.now + QUEUE_TIMES.rejoinWaitMs);
  const leaving = [{ playerId, notice: { kind: "match_missed" as const, rejoinAt }, rejoinAt }];
  const undone = withMatchUndone({ ...state, notices: [], starts: [] }, match, leaving, {
    kind: "match_not_started",
  });
  return { isOk: true, value: rematched(undone, context) };
}
