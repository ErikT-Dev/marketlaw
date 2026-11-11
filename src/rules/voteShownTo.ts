import type { SeatNumber } from "../shared/SeatNumber";
import type { VoteView } from "../shared/VoteView";
import { epochMsAfter } from "./epochMsAfter";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";

export function voteShownTo(state: GameState, viewer: SeatNumber): VoteView | null {
  const { vote } = state;
  if (vote === null || seatOf(state, viewer)?.departure !== null) {
    return null;
  }
  return {
    caller: vote.caller,
    deadline: epochMsAfter(vote.deadline, 0),
    answered: vote.ballots.length,
    of: vote.asked.length,
    hasToAnswer:
      vote.asked.includes(viewer) && !vote.ballots.some(({ seat }) => seat === viewer),
  };
}
