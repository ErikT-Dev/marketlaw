import type { GameAction } from "./GameAction";
import type { VoteAction } from "./VoteAction";

export function isVoteAction(action: GameAction): action is VoteAction {
  return action.type === "call_vote" || action.type === "vote";
}
