import type { SavedGame } from "../../rules/SavedGame";
import type { RoomGame } from "./RoomGame";

export function withTimeOutsApplied(game: RoomGame, caughtUp: SavedGame): RoomGame {
  return caughtUp === game.saved
    ? game
    : {
        saved: caughtUp,
        seats: game.seats.map((seat) => ({ ...seat, stateVersion: seat.stateVersion + 1 })),
      };
}
