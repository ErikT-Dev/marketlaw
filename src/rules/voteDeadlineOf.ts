import type { GameState } from "./GameState";

export function voteDeadlineOf(state: GameState): number | null {
  return state.vote === null ? null : state.vote.deadline;
}
