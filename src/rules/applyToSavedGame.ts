import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { SavedGame } from "./SavedGame";
import { seededRandom } from "./seededRandom";

export function applyToSavedGame(
  saved: SavedGame,
  action: GameAction,
): Result<SavedGame, Rejection> {
  const stream = saved.actionLog.length + 1;
  const result = apply(saved.state, action, seededRandom(saved.seed, stream));
  return result.isOk
    ? {
        isOk: true,
        value: { ...saved, actionLog: [...saved.actionLog, action], state: result.value },
      }
    : result;
}
