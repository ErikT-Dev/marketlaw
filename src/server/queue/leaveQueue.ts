import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { releasePlayer } from "../lobby/releasePlayer";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";

export function leaveQueue(
  state: QueueState,
  playerId: PlayerId,
): Result<QueueState, QueueRejection> {
  const { queue, lobby } = state;
  if (!queue.entries.some((entry) => entry.playerId === playerId)) {
    return { isOk: false, error: "not_in_queue" };
  }
  return {
    isOk: true,
    value: {
      queue: { ...queue, entries: queue.entries.filter((entry) => entry.playerId !== playerId) },
      lobby: releasePlayer(lobby, playerId, RANKED_QUEUE_PLACE),
    },
  };
}
