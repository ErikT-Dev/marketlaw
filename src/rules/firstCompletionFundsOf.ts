import type { QuestName } from "../shared/catalogue/QuestName";
import { questOf } from "../shared/ruleFiles/questOf";

const FIRST_COMPLETION_FUNDS_PER_TIER = 2;

export function firstCompletionFundsOf(quest: QuestName): number {
  return FIRST_COMPLETION_FUNDS_PER_TIER * questOf(quest).tier;
}
