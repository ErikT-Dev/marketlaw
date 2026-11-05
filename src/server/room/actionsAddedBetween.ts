import { isSystemAction } from "../../rules/isSystemAction";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { PlayedActions } from "../lobby/PlayedActions";
import type { RoomRecord } from "./RoomRecord";

function seatsInGame(record: RoomRecord | null): ReadonlyArray<SeatNumber> {
  const state = record?.game?.saved.state;
  if (state === undefined || state.phase === "ended") {
    return [];
  }
  return state.seats.filter((seat) => !seat.hasLeft).map(({ seat }) => seat);
}

export function actionsAddedBetween(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<PlayedActions> {
  const game = after?.game ?? before?.game ?? null;
  if (game === null || game.saved.startingState !== null) {
    return [];
  }
  const stillIn = seatsInGame(after);
  const leaving = seatsInGame(before).filter((seat) => !stillIn.includes(seat));
  return game.seats
    .filter(({ seat }) => leaving.includes(seat))
    .map(({ seat, playerId }) => ({
      playerId,
      actions: game.saved.actionLog.filter(
        ({ action }) => action.seat === seat && !isSystemAction(action),
      ).length,
    }));
}
