import type { QuestName } from "./QuestName";
import type { QuestTerms } from "./QuestTerms";
import { QUEST_TERMS_TIER_1 } from "./QUEST_TERMS_TIER_1";
import { QUEST_TERMS_TIER_2 } from "./QUEST_TERMS_TIER_2";
import { QUEST_TERMS_TIER_3 } from "./QUEST_TERMS_TIER_3";

export const QUEST_TERMS: Readonly<Record<QuestName, QuestTerms>> = {
  ...QUEST_TERMS_TIER_1,
  ...QUEST_TERMS_TIER_2,
  ...QUEST_TERMS_TIER_3,
};
