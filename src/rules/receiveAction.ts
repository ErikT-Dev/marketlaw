import { applyDueTimeOuts } from "./applyDueTimeOuts";
import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameAction } from "./GameAction";
import { hasTimedOutThisDecision } from "./hasTimedOutThisDecision";
import { isVoteAction } from "./isVoteAction";
import { marketGoOf } from "./marketGoOf";
import type { Random } from "./Random";
import type { ReceivedAction } from "./ReceivedAction";
import type { SavedGame } from "./SavedGame";
import type { VoteAction } from "./VoteAction";

function receiveVoteAction(
  saved: SavedGame,
  action: VoteAction,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): ReceivedAction {
  const caughtUp = applyDueTimeOuts(saved, at, randomFor);
  const result = applyToSavedGame(caughtUp, action, at, randomFor(caughtUp));
  return result.isOk
    ? { caughtUp, saved: result.value, rejection: null }
    : { caughtUp, saved: caughtUp, rejection: result.error };
}

export function receiveAction(
  saved: SavedGame,
  action: GameAction,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): ReceivedAction {
  if (isVoteAction(action)) {
    return receiveVoteAction(saved, action, at, randomFor);
  }
  const isOwnTimeOutDue = dueTimeOuts(saved.state, at).includes(action.seat);
  const caughtUp = isOwnTimeOutDue ? applyDueTimeOuts(saved, at, randomFor) : saved;
  if (isOwnTimeOutDue && marketGoOf(saved.state) === action.seat) {
    return { caughtUp, saved: caughtUp, rejection: { code: "out_of_time" } };
  }
  if (hasTimedOutThisDecision(caughtUp, action.seat)) {
    return { caughtUp, saved: caughtUp, rejection: { code: "out_of_time" } };
  }
  const result = applyToSavedGame(caughtUp, action, at, randomFor(caughtUp));
  return result.isOk
    ? { caughtUp, saved: result.value, rejection: null }
    : { caughtUp, saved: caughtUp, rejection: result.error };
}
