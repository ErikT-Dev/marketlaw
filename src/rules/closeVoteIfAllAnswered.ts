import { closeVote } from "./closeVote";
import type { GameState } from "./GameState";
import { seatsStillAsked } from "./seatsStillAsked";

export function closeVoteIfAllAnswered(state: GameState, at: number): GameState {
  const { vote } = state;
  const isAllAnswered =
    vote !== null &&
    seatsStillAsked(state, vote).every((asked) => vote.ballots.some(({ seat }) => seat === asked));
  return isAllAnswered ? closeVote(state, at) : state;
}
