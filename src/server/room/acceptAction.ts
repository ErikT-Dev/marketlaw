import type { SavedGame } from "../../rules/SavedGame";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { RoomGame } from "./RoomGame";

const REMEMBERED_ACTION_IDS = 100;

export function acceptAction(
  game: RoomGame,
  actor: { readonly seat: SeatNumber; readonly actionId: string },
  saved: SavedGame,
): RoomGame {
  const isVisibleToAll =
    saved.state.turn !== game.saved.state.turn ||
    saved.state.phase !== game.saved.state.phase ||
    game.saved.state.phase === "market";
  return {
    ...game,
    saved,
    seats: game.seats.map((seat) => {
      if (seat.seat === actor.seat) {
        return {
          ...seat,
          stateVersion: seat.stateVersion + 1,
          acceptedActionIds: [...seat.acceptedActionIds, actor.actionId].slice(
            -REMEMBERED_ACTION_IDS,
          ),
        };
      }
      return isVisibleToAll ? { ...seat, stateVersion: seat.stateVersion + 1 } : seat;
    }),
  };
}
