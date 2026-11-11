import type { SeatNumber } from "../shared/SeatNumber";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";
import { TIME_RULES } from "./TIME_RULES";

export function seatsLeavingAt(state: GameState, at: number): ReadonlyArray<SeatNumber> {
  if (state.phase !== "main" || state.kind !== "ranked") {
    return [];
  }
  return dueTimeOuts(state, at).filter(
    (seat) => (seatOf(state, seat)?.timeoutsInARow ?? 0) + 1 >= TIME_RULES.timeoutsBeforeLeaving,
  );
}
