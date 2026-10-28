import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";

export function replayStartOf(saved: SavedGame): SavedGame {
  return saved.startingState === null
    ? startSavedGame(saved.setup, saved.seed)
    : { ...saved, actionLog: [], state: saved.startingState };
}
