import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";
import { STARTING_WORTH_GAINED } from "./STARTING_WORTH_GAINED";
import type { Transition } from "./Transition";

export function worthGainedViolations({ before, action }: Transition, after: GameState): ReadonlyArray<string> {
  return after.seats.flatMap((afterSeat) => {
    const worth = afterSeat.worthGained;
    const worthBefore = seatOf(before, afterSeat.seat)?.worthGained ?? worth;
    const isUndoingOwnAction = action.type === "undo" && action.seat === afterSeat.seat;
    return worth < STARTING_WORTH_GAINED || (worth < worthBefore && !isUndoingOwnAction)
      ? [`I28: seat ${String(afterSeat.seat)} total worth gained went from ${String(worthBefore)} to ${String(worth)}`]
      : [];
  });
}
