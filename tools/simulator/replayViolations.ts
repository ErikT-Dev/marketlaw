import { applyToSavedGame } from "../../src/rules/applyToSavedGame.ts";
import { randomForNextAction } from "../../src/rules/randomForNextAction.ts";
import type { SavedGame } from "../../src/rules/SavedGame.ts";
import { startSavedGame } from "../../src/rules/startSavedGame.ts";

export function replayViolations(
  saved: SavedGame,
  statesAfterEachAction: ReadonlyArray<string>,
): ReadonlyArray<string> {
  let replayed = startSavedGame(saved.setup, saved.seed);
  for (const [index, action] of saved.actionLog.entries()) {
    const result = applyToSavedGame(replayed, action, randomForNextAction(replayed));
    if (!result.isOk) {
      return [`I26: action ${String(index + 1)} was rejected on replay with ${result.error.code}`];
    }
    replayed = result.value;
    if (JSON.stringify(replayed.state) !== statesAfterEachAction[index]) {
      return [`I26: the state after action ${String(index + 1)} differs on replay`];
    }
  }
  return [];
}
