import type { EpochMs } from "../../shared/EpochMs";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { releasePlayer } from "../lobby/releasePlayer";
import type { QueueChange } from "./QueueChange";
import { QUEUE_TIMES } from "./QUEUE_TIMES";

export function withClosedConnectionsLeft(change: QueueChange, now: EpochMs): QueueChange {
  const { queue } = change;
  const leaving = queue.closedConnections
    .filter(({ since }) => since + QUEUE_TIMES.closedConnectionLeaveMs <= now)
    .map(({ playerId }) => playerId)
    .filter((playerId) => queue.entries.some((entry) => entry.playerId === playerId));
  if (leaving.length === 0) {
    return change;
  }
  return {
    ...change,
    queue: {
      ...queue,
      entries: queue.entries.filter(({ playerId }) => !leaving.includes(playerId)),
      closedConnections: queue.closedConnections.filter(
        ({ playerId }) => !leaving.includes(playerId),
      ),
    },
    lobby: leaving.reduce(
      (lobby, playerId) => releasePlayer(lobby, playerId, RANKED_QUEUE_PLACE),
      change.lobby,
    ),
  };
}
