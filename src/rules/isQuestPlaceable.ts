import type { QuestName } from "../shared/catalogue/QuestName";
import { incomeToPlaceQuestOf } from "../shared/ruleFiles/incomeToPlaceQuestOf";
import { questOf } from "../shared/ruleFiles/questOf";

export function isQuestPlaceable(quest: QuestName, highestIncome: number): boolean {
  return incomeToPlaceQuestOf(questOf(quest).terms) <= highestIncome;
}
