import { expectedResultOf } from "./expectedResultOf";
import { kFactorOf } from "./kFactorOf";
import type { RatedSeat } from "./RatedSeat";
import { roundedTotalChange } from "./roundedTotalChange";
import type { SeatRatingChange } from "./SeatRatingChange";

function changeAgainst(player: RatedSeat, opponent: RatedSeat, k: number): number {
  const result = player.place < opponent.place ? 1 : 0;
  return k * (result - expectedResultOf(player.rating, opponent.rating));
}

export function ratingChangesOf(seats: ReadonlyArray<RatedSeat>): ReadonlyArray<SeatRatingChange> {
  return seats.map((player) => {
    const k = kFactorOf(player, seats.length);
    const opponents = seats.filter((opponent) => opponent.seat !== player.seat);
    return {
      seat: player.seat,
      change: roundedTotalChange(opponents.map((opponent) => changeAgainst(player, opponent, k))),
    };
  });
}
