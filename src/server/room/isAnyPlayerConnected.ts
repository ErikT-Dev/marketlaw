import type { PlayerId } from "../../shared/PlayerId";
import type { RoomGame } from "./RoomGame";

export function isAnyPlayerConnected(game: RoomGame, livePlayers: ReadonlyArray<PlayerId>) {
  return game.seats.some(
    (seat) =>
      livePlayers.includes(seat.playerId) &&
      game.saved.state.seats.some((state) => state.seat === seat.seat && !state.hasLeft),
  );
}
