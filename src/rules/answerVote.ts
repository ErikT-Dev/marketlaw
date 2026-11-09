import type { SeatNumber } from "../shared/SeatNumber";
import type { VoteAnswer } from "../shared/VoteAnswer";
import { closeVoteIfAllAnswered } from "./closeVoteIfAllAnswered";
import type { GameState } from "./GameState";

export function answerVote(
  state: GameState,
  seat: SeatNumber,
  answer: VoteAnswer,
  at: number,
): GameState {
  const { vote } = state;
  if (vote === null) {
    return state;
  }
  const answered = { ...state, vote: { ...vote, ballots: [...vote.ballots, { seat, answer }] } };
  return closeVoteIfAllAnswered(answered, at);
}
