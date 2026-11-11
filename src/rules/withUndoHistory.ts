import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";
import { updateSeat } from "./updateSeat";

const UNDOABLE_ACTIONS: ReadonlyArray<GameAction["type"]> = [
  "play_card",
  "claim_all",
  "complete_quest",
  "influence",
];

function undoPointOf(seat: SeatState): SeatState {
  return { ...seat, undoPoints: [], isUndoBlocked: false };
}

function isUndoable(before: GameState, action: GameAction, after: GameState): boolean {
  const incomeBefore = seatOf(before, action.seat)?.stats.income;
  const incomeAfter = seatOf(after, action.seat)?.stats.income;
  return (
    UNDOABLE_ACTIONS.includes(action.type) &&
    after.drawLog.length === before.drawLog.length &&
    incomeAfter === incomeBefore
  );
}

export function withUndoHistory(before: GameState, action: GameAction, after: GameState): GameState {
  const seatBefore = seatOf(before, action.seat);
  if (action.type === "undo" ||
    action.type === "end_turn" ||
    (action.type === "turn_draw" && seatBefore?.isTurnDrawOpen !== true) ||
    action.type === "time_out" ||
    action.type === "leave_game" ||
    action.type === "call_vote" ||
    action.type === "vote" ||
    action.type === "close_vote" || seatBefore === undefined) {
    return after;
  }
  return updateSeat(after, action.seat, (seat) =>
    isUndoable(before, action, after)
      ? { ...seat, undoPoints: [...seatBefore.undoPoints, undoPointOf(seatBefore)] }
      : { ...seat, undoPoints: [], isUndoBlocked: true },
  );
}
