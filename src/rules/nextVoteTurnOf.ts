import type { GameState } from "./GameState";
import { VOTE_RULES } from "./VOTE_RULES";

export function nextVoteTurnOf(state: GameState): number {
  return state.lastVoteTurn === null ? 1 : state.lastVoteTurn + VOTE_RULES.turnsBetweenVotes;
}
