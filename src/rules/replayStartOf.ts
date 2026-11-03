import type { SavedGame } from "./SavedGame";
import { startSavedGame } from "./startSavedGame";

export function replayStartOf(saved: Omit<SavedGame, "actionLog" | "state">): SavedGame {
  return saved.startingState === null
    ? startSavedGame(saved.setup, saved.seed)
    : { ...saved, actionLog: [], state: saved.startingState };
}
