import type { ReasonCode } from "../shared/ReasonCode";
import type { GameState } from "./GameState";
import type { VoteAction } from "./VoteAction";
import { nextVoteTurnOf } from "./nextVoteTurnOf";

function callRejection(state: GameState): ReasonCode | undefined {
  if (state.vote !== null) {
    return "vote_already_open";
  }
  return state.turn < nextVoteTurnOf(state) ? "vote_too_soon" : undefined;
}

function answerRejection(state: GameState, action: VoteAction): ReasonCode | undefined {
  const { vote } = state;
  if (vote === null) {
    return "no_vote_open";
  }
  const isStillAsked =
    vote.asked.includes(action.seat) && !vote.ballots.some(({ seat }) => seat === action.seat);
  return isStillAsked ? undefined : "vote_already_answered";
}

export function voteRejectionOf(state: GameState, action: VoteAction): ReasonCode | undefined {
  return action.type === "call_vote" ? callRejection(state) : answerRejection(state, action);
}
