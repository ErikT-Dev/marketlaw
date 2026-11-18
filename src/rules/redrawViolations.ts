import type { GameState } from "./GameState";
import { REDRAW_LIMIT } from "./REDRAW_LIMIT";
import { seatOf } from "./seatOf";

export function redrawViolations(before: GameState, after: GameState): ReadonlyArray<string> {
  return after.seats.flatMap((afterSeat) => {
    const seatBefore = seatOf(before, afterSeat.seat);
    const usedBefore = seatBefore?.redrawsUsed ?? 0;
    const hasRedrawn = afterSeat.redrawsUsed > usedBefore;
    const isTooLate = before.turn !== 1 || (seatBefore?.actionsThisTurn ?? 0) > 0;
    return afterSeat.redrawsUsed > REDRAW_LIMIT || (hasRedrawn && isTooLate)
      ? [`I29: seat ${String(afterSeat.seat)} redrew in turn ${String(before.turn)} (${String(afterSeat.redrawsUsed)} redraws)`]
      : [];
  });
}
