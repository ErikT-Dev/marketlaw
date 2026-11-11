import type { SeatNumber } from "../shared/SeatNumber";
import { decisionClockOf } from "./decisionClockOf";
import { isInOwnMainPhase } from "./isInOwnMainPhase";
import { isVoteAction } from "./isVoteAction";
import type { SavedGame } from "./SavedGame";
import { seatOf } from "./seatOf";

export function hasTimedOutThisDecision(saved: SavedGame, seat: SeatNumber): boolean {
  const last = [...saved.actionLog].reverse().find(({ action }) => action.seat === seat && !isVoteAction(action) && action.type !== "close_vote");
  const seatState = seatOf(saved.state, seat);
  return (
    saved.state.phase === "market" &&
    seatState !== undefined &&
    !isInOwnMainPhase(saved.state, seatState) &&
    last?.action.type === "time_out" &&
    last.at >= saved.state.clockStartedAt &&
    decisionClockOf(saved.state, seat) === null
  );
}
