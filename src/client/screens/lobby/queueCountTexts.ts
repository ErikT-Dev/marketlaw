import type { QueueCounts } from "../../../shared/protocol/QueueCounts";
import { RANKED_GAME_SIZES } from "../../../shared/RANKED_GAME_SIZES";

function playersText(count: number): string {
  return count === 1 ? "1 player" : `${String(count)} players`;
}

export function queueCountTexts(counts: QueueCounts) {
  return {
    total: `${playersText(counts.total)} in the queue`,
    bySize: RANKED_GAME_SIZES.map(
      (size) => `${String(size)} players: ${String(counts.bySize[size])}`,
    ).join(" · "),
    includingYou: `${counts.total === 1 ? "1 player is" : `${String(counts.total)} players are`} in the queue, including you.`,
  };
}
