import { applyToSavedGame } from "../../rules/applyToSavedGame";
import type { GameAction } from "../../rules/GameAction";
import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { RoomGame } from "./RoomGame";

export function withSystemAction(
  game: RoomGame,
  action: GameAction,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): RoomGame {
  const result = applyToSavedGame(game.saved, action, at, randomFor(game.saved));
  return result.isOk
    ? {
        ...game,
        saved: result.value,
        seats: game.seats.map((seat) => ({ ...seat, stateVersion: seat.stateVersion + 1 })),
      }
    : game;
}
