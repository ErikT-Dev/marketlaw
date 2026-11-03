import type { SavedGame } from "../../rules/SavedGame";
import type { RoomGame } from "./RoomGame";

export function withTimeOutsApplied(game: RoomGame, caughtUp: SavedGame): RoomGame {
  if (caughtUp === game.saved) {
    return game;
  }
  const before = game.saved.state;
  const isVisibleToAll =
    caughtUp.state.turn !== before.turn ||
    caughtUp.state.phase !== before.phase ||
    before.phase === "market";
  const timedOut = caughtUp.actionLog
    .slice(game.saved.actionLog.length)
    .map(({ action }) => action.seat);
  return {
    ...game,
    saved: caughtUp,
    seats: game.seats.map((seat) =>
      isVisibleToAll || timedOut.includes(seat.seat)
        ? { ...seat, stateVersion: seat.stateVersion + 1 }
        : seat,
    ),
  };
}
