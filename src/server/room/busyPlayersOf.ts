import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";

export function busyPlayersOf(record: RoomRecord): ReadonlyArray<Identity> {
  const { game } = record;
  if (game === null) {
    return record.players;
  }
  if (game.saved.state.phase === "ended") {
    return [];
  }
  const seatsThatLeft = game.saved.state.seats.filter((seat) => seat.departure !== null);
  return record.players.filter(({ playerId }) => {
    const seat = game.seats.find((candidate) => candidate.playerId === playerId)?.seat;
    return !seatsThatLeft.some((left) => left.seat === seat);
  });
}
