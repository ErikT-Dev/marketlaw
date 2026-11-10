import type { PlayerId } from "../../shared/PlayerId";

export function accountCountKeyOf(playerId: PlayerId): string {
  return `account:${playerId}`;
}
