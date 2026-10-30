import { applyToSavedGame } from "../../src/rules/applyToSavedGame.ts";
import { invariantViolations } from "../../src/rules/invariantViolations.ts";
import { randomForNextAction } from "../../src/rules/randomForNextAction.ts";
import type { SavedGame } from "../../src/rules/SavedGame.ts";

export function newActionChecks(
  before: SavedGame,
  after: SavedGame,
): { readonly states: ReadonlyArray<string>; readonly violations: ReadonlyArray<string> } {
  const states: string[] = [];
  const violations: string[] = [];
  let current = before;
  for (const { action, at } of after.actionLog.slice(before.actionLog.length)) {
    const result = applyToSavedGame(current, action, at, randomForNextAction(current));
    if (!result.isOk) {
      return {
        states,
        violations: [...violations, `I26: a logged ${action.type} is rejected when applied again`],
      };
    }
    states.push(JSON.stringify(result.value.state));
    violations.push(
      ...invariantViolations({
        before: current.state,
        beforeAsText: JSON.stringify(current.state),
        action,
        outcome: { isOk: true, value: result.value.state },
      }),
    );
    current = result.value;
  }
  const isSavedStateReached = JSON.stringify(current.state) === JSON.stringify(after.state);
  return {
    states,
    violations: isSavedStateReached
      ? violations
      : [...violations, "I26: the logged actions do not lead to the saved state"],
  };
}
