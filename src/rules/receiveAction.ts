import { applyDueTimeOuts } from "./applyDueTimeOuts";
import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import type { GameAction } from "./GameAction";
import type { Random } from "./Random";
import type { ReceivedAction } from "./ReceivedAction";
import type { SavedGame } from "./SavedGame";

export function receiveAction(
  saved: SavedGame,
  action: GameAction,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): ReceivedAction {
  const caughtUp = applyDueTimeOuts(saved, at, randomFor);
  if (dueTimeOuts(saved.state, at).includes(action.seat)) {
    return { caughtUp, saved: caughtUp, rejection: { code: "out_of_time" } };
  }
  const result = applyToSavedGame(caughtUp, action, at, randomFor(caughtUp));
  return result.isOk
    ? { caughtUp, saved: result.value, rejection: null }
    : { caughtUp, saved: caughtUp, rejection: result.error };
}
