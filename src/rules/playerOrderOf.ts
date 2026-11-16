import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { seatsInPlayerOrderOf } from "./seatsInPlayerOrderOf";

export function playerOrderOf(state: GameState): ReadonlyArray<SeatNumber> {
  return seatsInPlayerOrderOf(state)
    .filter((seat) => seat.departure === null)
    .map((seat) => seat.seat);
}
