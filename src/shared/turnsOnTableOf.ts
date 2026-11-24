import type { QuestName } from "./catalogue/QuestName";
import { QUEST_TURNS_ON_TABLE_OF_TIER } from "./QUEST_TURNS_ON_TABLE_OF_TIER";
import { questOf } from "./ruleFiles/questOf";

export function turnsOnTableOf(quest: QuestName): number {
  return QUEST_TURNS_ON_TABLE_OF_TIER[questOf(quest).tier];
}
