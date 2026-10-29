import type { SeatState } from "./SeatState";

export function undoLatest(seat: SeatState): SeatState {
  const latest = seat.undoPoints.at(-1);
  if (latest === undefined) {
    return seat;
  }
  return {
    ...latest,
    actionsThisTurn: seat.actionsThisTurn + 1,
    isDone: seat.isDone,
    hasLeft: seat.hasLeft,
    timeBankMs: seat.timeBankMs,
    undoPoints: seat.undoPoints.slice(0, -1),
    isUndoBlocked: seat.isUndoBlocked,
  };
}
