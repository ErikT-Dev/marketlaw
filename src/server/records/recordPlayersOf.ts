import type { SeatNumber } from "../../shared/SeatNumber";
import type { SeatRecord } from "../../shared/records/SeatRecord";
import { ratingBeforeGameOf } from "../ratings/ratingBeforeGameOf";
import { ratingChangesOf } from "../ratings/ratingChangesOf";
import type { SeatRatingChange } from "../ratings/SeatRatingChange";
import type { RoomGame } from "../room/RoomGame";
import type { RecordPlayer } from "./RecordPlayer";

function placeOf(seats: ReadonlyArray<SeatRecord>, seat: SeatNumber): number {
  const recorded = seats.find((candidate) => candidate.seat === seat);
  if (recorded === undefined) {
    throw new Error(`the game record has no place for seat ${String(seat)}`);
  }
  return recorded.place;
}

function changeOf(changes: ReadonlyArray<SeatRatingChange>, seat: SeatNumber): number {
  const changed = changes.find((candidate) => candidate.seat === seat);
  if (changed === undefined) {
    throw new Error(`no rating change for seat ${String(seat)}`);
  }
  return changed.change;
}

export function recordPlayersOf(
  game: RoomGame,
  seats: ReadonlyArray<SeatRecord>,
): ReadonlyArray<RecordPlayer> {
  if (game.kind === "casual") {
    return game.seats.map(({ seat, playerId }) => ({ seat, playerId, rating: null }));
  }
  const rated = game.seats.map(({ seat, playerId }) => ({
    ...ratingBeforeGameOf(game.ratingsBeforeGame, playerId),
    seat,
    playerId,
    place: placeOf(seats, seat),
  }));
  const changes = ratingChangesOf(rated);
  return rated.map(({ seat, playerId, rating }) => ({
    seat,
    playerId,
    rating: { before: rating, change: changeOf(changes, seat) },
  }));
}
