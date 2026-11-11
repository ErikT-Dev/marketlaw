import type { SeatNumber } from "../shared/SeatNumber";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameState } from "./GameState";
import { marketGoOf } from "./marketGoOf";
import { seatOf } from "./seatOf";
import { TIME_RULES } from "./TIME_RULES";

export function seatsLeavingAt(state: GameState, at: number): ReadonlyArray<SeatNumber> {
  if (state.kind !== "ranked") {
    return [];
  }
  return dueTimeOuts(state, at).filter(
    (seat) =>
      marketGoOf(state) !== seat &&
      (seatOf(state, seat)?.timeoutsInARow ?? 0) + 1 >= TIME_RULES.timeoutsBeforeLeaving,
  );
}
