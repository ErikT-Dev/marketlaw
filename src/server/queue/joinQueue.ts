import type { Result } from "../../shared/Result";
import { claimPlayer } from "../lobby/claimPlayer";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { gameSizesOf } from "./gameSizesOf";
import { isInQueue } from "./isInQueue";
import { matchQueue } from "./matchQueue";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueJoiner } from "./QueueJoiner";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";

function standingRejection(joiner: QueueJoiner): QueueRejection | null {
  switch (joiner.standing) {
    case "guest":
      return "not_registered";
    case "email_not_confirmed":
      return "email_not_confirmed";
    case "email_confirmed":
      return null;
  }
}

function placeRejection(
  state: QueueState,
  joiner: QueueJoiner,
  context: QueueContext,
): QueueRejection | null {
  const { queue } = state;
  if (isInQueue(queue, joiner.playerId)) {
    return "busy_elsewhere";
  }
  const isWaitingToRejoin = queue.rejoinWaits.some(
    (wait) => wait.playerId === joiner.playerId && wait.until > context.now,
  );
  return isWaitingToRejoin ? "rejoin_too_soon" : null;
}

export function joinQueue(
  state: QueueState,
  joiner: QueueJoiner,
  requestedSizes: ReadonlyArray<number> | null,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  const sizes = gameSizesOf(requestedSizes);
  const rejection = standingRejection(joiner) ?? (sizes.isOk ? null : sizes.error);
  if (rejection !== null || !sizes.isOk) {
    return { isOk: false, error: rejection ?? "invalid_game_sizes" };
  }
  const { playerId } = joiner;
  const placeProblem = placeRejection(state, joiner, context);
  const claimed =
    placeProblem === null
      ? claimPlayer(state.lobby, playerId, RANKED_QUEUE_PLACE, context.now)
      : { isOk: false as const, error: placeProblem };
  if (!claimed.isOk) {
    return claimed;
  }
  const queue = {
    ...state.queue,
    entries: [...state.queue.entries, { playerId, sizes: sizes.value }],
    rejoinWaits: state.queue.rejoinWaits.filter((wait) => wait.playerId !== playerId),
  };
  return { isOk: true, value: matchQueue({ queue, lobby: claimed.value }, context) };
}
