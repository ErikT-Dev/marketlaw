import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { QueueMatch } from "./QueueMatch";
import type { QueueRecord } from "./QueueRecord";

export function openMatchOf(
  queue: QueueRecord,
  playerId: PlayerId,
  now: EpochMs,
): QueueMatch | undefined {
  return queue.matches.find(
    (match) => match.deadline > now && match.players.some((entry) => entry.playerId === playerId),
  );
}
