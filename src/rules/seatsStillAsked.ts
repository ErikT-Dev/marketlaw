import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { OpenVote } from "./OpenVote";
import { seatOf } from "./seatOf";

export function seatsStillAsked(state: GameState, vote: OpenVote): ReadonlyArray<SeatNumber> {
  return vote.asked.filter((asked) => seatOf(state, asked)?.departure === null);
}
