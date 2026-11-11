import type { PlayerId } from "../../shared/PlayerId";

export function matchHistoryHash(playerId: PlayerId): string {
  return `#history/${playerId}`;
}
