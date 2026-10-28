import type { RoomUpdate } from "../../src/shared/protocol/RoomUpdate.ts";

export function scanTextOf(update: RoomUpdate): string {
  const game = update.game;
  return JSON.stringify(
    game === null ? update : { ...update, game: { ...game, view: { ...game.view, discard: [] } } },
  );
}
