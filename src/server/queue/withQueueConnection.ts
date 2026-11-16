import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import { isInQueue } from "./isInQueue";
import type { QueueRecord } from "./QueueRecord";

export function withQueueConnection(
  queue: QueueRecord,
  playerId: PlayerId,
  connection: { readonly isConnected: boolean; readonly at: EpochMs },
): QueueRecord {
  const others = queue.closedConnections.filter((closed) => closed.playerId !== playerId);
  const isRecorded = others.length !== queue.closedConnections.length;
  if (connection.isConnected) {
    return isRecorded ? { ...queue, closedConnections: others } : queue;
  }
  return isRecorded || !isInQueue(queue, playerId)
    ? queue
    : {
        ...queue,
        closedConnections: [...queue.closedConnections, { playerId, since: connection.at }],
      };
}
