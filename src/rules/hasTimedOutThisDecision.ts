import type { SeatNumber } from "../shared/SeatNumber";
import { decisionClockOf } from "./decisionClockOf";
import { isVoteAction } from "./isVoteAction";
import type { SavedGame } from "./SavedGame";

export function hasTimedOutThisDecision(saved: SavedGame, seat: SeatNumber): boolean {
  const last = [...saved.actionLog].reverse().find(({ action }) => action.seat === seat && !isVoteAction(action) && action.type !== "close_vote");
  return (
    last?.action.type === "time_out" &&
    last.at >= saved.state.clockStartedAt &&
    decisionClockOf(saved.state, seat) === null
  );
}
