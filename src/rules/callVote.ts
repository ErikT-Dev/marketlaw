import type { SeatNumber } from "../shared/SeatNumber";
import { closeVoteIfAllAnswered } from "./closeVoteIfAllAnswered";
import type { GameState } from "./GameState";
import { VOTE_RULES } from "./VOTE_RULES";

export function callVote(state: GameState, caller: SeatNumber, at: number): GameState {
  const asked = state.seats
    .filter((seat) => seat.departure === null && seat.seat !== caller)
    .map(({ seat }) => seat);
  const called = {
    ...state,
    lastVoteTurn: state.turn,
    vote: { caller, asked, ballots: [], deadline: at + VOTE_RULES.answerMs },
  };
  return closeVoteIfAllAnswered(called, at);
}
