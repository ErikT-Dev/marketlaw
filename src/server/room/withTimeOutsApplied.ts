import type { SavedGame } from "../../rules/SavedGame";
import { isChangeVisibleToAll } from "./isChangeVisibleToAll";
import type { RoomGame } from "./RoomGame";

export function withTimeOutsApplied(game: RoomGame, caughtUp: SavedGame): RoomGame {
  if (caughtUp === game.saved) {
    return game;
  }
  const added = caughtUp.actionLog.slice(game.saved.actionLog.length).map(({ action }) => action);
  const timedOut = added.filter(({ type }) => type !== "close_vote").map(({ seat }) => seat);
  const isVisibleToAll = isChangeVisibleToAll(
    game.saved.state,
    caughtUp.state,
    timedOut.length === 0,
  );
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
