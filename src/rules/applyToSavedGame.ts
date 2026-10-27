import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { Random } from "./Random";
import type { SavedGame } from "./SavedGame";

export function applyToSavedGame(
  saved: SavedGame,
  action: GameAction,
  random: Random,
): Result<SavedGame, Rejection> {
  const result = apply(saved.state, action, random);
  return result.isOk
    ? {
        isOk: true,
        value: { ...saved, actionLog: [...saved.actionLog, action], state: result.value },
      }
    : result;
}
