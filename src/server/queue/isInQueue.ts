import type { PlayerId } from "../../shared/PlayerId";
import type { QueueRecord } from "./QueueRecord";

export function isInQueue(queue: QueueRecord, playerId: PlayerId): boolean {
  return [...queue.entries, ...queue.matches.flatMap(({ players }) => players)].some(
    (entry) => entry.playerId === playerId,
  );
}
