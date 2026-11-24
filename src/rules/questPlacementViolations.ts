import type { GameState } from "./GameState";
import { highestIncomeInGameOf } from "./highestIncomeInGameOf";
import { isQuestPlaceable } from "./isQuestPlaceable";

export function questPlacementViolations(
  before: GameState,
  after: GameState,
): ReadonlyArray<string> {
  if (after.turn === before.turn) {
    return [];
  }
  const highestIncome = highestIncomeInGameOf(after.seats);
  return after.quests.flatMap((place) =>
    place === null ||
    place.turnsOnTable > 1 ||
    before.quests.some((placeBefore) => placeBefore?.quest === place.quest) ||
    isQuestPlaceable(place.quest, highestIncome)
      ? []
      : [`I16: ${place.quest} was placed while the highest income was ${String(highestIncome)}`],
  );
}
