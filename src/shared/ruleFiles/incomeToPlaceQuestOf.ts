import type { QuestNeed } from "../catalogue/QuestNeed";
import type { QuestTerms } from "../catalogue/QuestTerms";

const INCOME_BELOW_NEEDED_INCOME = 20;
const INCOME_FOR_PROJECT_QUESTS = 80;
const INCOME_FOR_ANY_QUEST = Number.NEGATIVE_INFINITY;

function incomeToPlaceFor(need: QuestNeed): number {
  switch (need.kind) {
    case "income":
      return need.count - INCOME_BELOW_NEEDED_INCOME;
    case "projects":
      return INCOME_FOR_PROJECT_QUESTS;
    case "cards":
    case "sectors_with_tier":
    case "type":
    case "stat":
      return INCOME_FOR_ANY_QUEST;
  }
}

export function incomeToPlaceQuestOf(terms: QuestTerms): number {
  return Math.max(INCOME_FOR_ANY_QUEST, ...terms.needs.map(incomeToPlaceFor));
}
