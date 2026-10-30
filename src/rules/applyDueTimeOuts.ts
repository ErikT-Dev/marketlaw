import { applyToSavedGame } from "./applyToSavedGame";
import { dueTimeOuts } from "./dueTimeOuts";
import type { Random } from "./Random";
import type { SavedGame } from "./SavedGame";

export function applyDueTimeOuts(
  saved: SavedGame,
  at: number,
  randomFor: (saved: SavedGame) => Random,
): SavedGame {
  return dueTimeOuts(saved.state, at).reduce((current, seat) => {
    const result = applyToSavedGame(current, { type: "time_out", seat }, at, randomFor(current));
    return result.isOk ? result.value : current;
  }, saved);
}
