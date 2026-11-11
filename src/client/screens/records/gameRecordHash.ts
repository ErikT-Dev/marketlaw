import type { GameId } from "../../../shared/GameId";

export function gameRecordHash(gameId: GameId): string {
  return `#record/${gameId}`;
}
