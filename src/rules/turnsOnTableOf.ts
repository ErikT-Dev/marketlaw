import type { QuestName } from "../shared/catalogue/QuestName";
import { questOf } from "../shared/ruleFiles/questOf";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";

export function turnsOnTableOf(quest: QuestName): number {
  return QUEST_TABLE_RULES.turnsOnTableOfTier[questOf(quest).tier];
}
