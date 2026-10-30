import { applyDueTimeOuts } from "./applyDueTimeOuts";
import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameAction } from "./GameAction";
import { hasTimedOutThisDecision } from "./hasTimedOutThisDecision";
import type { Random } from "./Random";
import type { ReceivedAction } from "./ReceivedAction";
import type { SavedGame } from "./SavedGame";

export function receiveAction(
  saved: SavedGame,
  action: GameAction,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): ReceivedAction {
  if (dueTimeOuts(saved.state, at).includes(action.seat)) {
    const caughtUp = applyDueTimeOuts(saved, at, randomFor);
    return { caughtUp, saved: caughtUp, rejection: { code: "out_of_time" } };
  }
  if (hasTimedOutThisDecision(saved, action.seat)) {
    return { caughtUp: saved, saved, rejection: { code: "out_of_time" } };
  }
  const result = applyToSavedGame(saved, action, at, randomFor(saved));
  return result.isOk
    ? { caughtUp: saved, saved: result.value, rejection: null }
    : { caughtUp: saved, saved, rejection: result.error };
}
