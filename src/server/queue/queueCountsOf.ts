import type { QueueCounts } from "../../shared/protocol/QueueCounts";
import type { RankedGameSize } from "../../shared/RankedGameSize";
import type { QueueRecord } from "./QueueRecord";

function countChoosing(queue: QueueRecord, size: RankedGameSize): number {
  return queue.entries.filter((entry) => entry.sizes.includes(size)).length;
}

export function queueCountsOf(queue: QueueRecord): QueueCounts {
  return {
    total: queue.entries.length,
    bySize: { 2: countChoosing(queue, 2), 3: countChoosing(queue, 3), 4: countChoosing(queue, 4) },
  };
}
