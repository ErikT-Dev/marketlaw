import type { SavedGame } from "../../rules/SavedGame";
import type { SeatNumber } from "../../shared/SeatNumber";
import { isChangeVisibleToAll } from "./isChangeVisibleToAll";
import type { RoomGame } from "./RoomGame";

const REMEMBERED_ACTION_IDS = 100;

type Actor = {
  readonly seat: SeatNumber;
  readonly actionId: string;
  readonly isVoting: boolean;
};

export function acceptAction(game: RoomGame, actor: Actor, saved: SavedGame): RoomGame {
  const isVisibleToAll = isChangeVisibleToAll(game.saved.state, saved.state, actor.isVoting);
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
