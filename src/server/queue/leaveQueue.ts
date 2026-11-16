import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { releasePlayer } from "../lobby/releasePlayer";
import { declineMatch } from "./declineMatch";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueRejection } from "./QueueRejection";
import type { QueueState } from "./QueueState";

export function leaveQueue(
  state: QueueState,
  playerId: PlayerId,
  context: QueueContext,
): Result<QueueChange, QueueRejection> {
  const { queue, lobby } = state;
  if (!queue.entries.some((entry) => entry.playerId === playerId)) {
    const declined = declineMatch(state, playerId, context);
    return declined.isOk ? declined : { isOk: false, error: "not_in_queue" };
  }
  return {
    isOk: true,
    value: {
      queue: {
        ...queue,
        entries: queue.entries.filter((entry) => entry.playerId !== playerId),
        closedConnections: queue.closedConnections.filter((closed) => closed.playerId !== playerId),
      },
      lobby: releasePlayer(lobby, playerId, RANKED_QUEUE_PLACE),
      notices: [],
      starts: [],
    },
  };
}
