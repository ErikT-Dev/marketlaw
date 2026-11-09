import { endGame } from "./endGame";
import type { GameState } from "./GameState";
import { seatsStillAsked } from "./seatsStillAsked";

export function closeVote(state: GameState, at: number): GameState {
  const { vote } = state;
  if (vote === null) {
    return state;
  }
  const isPassed = seatsStillAsked(state, vote).every((asked) =>
    vote.ballots.some(({ seat, answer }) => seat === asked && answer === "yes"),
  );
  const closed = { ...state, vote: null };
  return isPassed ? endGame(closed, at, "abandoned_by_vote") : closed;
}
