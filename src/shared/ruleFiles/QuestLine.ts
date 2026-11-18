import type { QuestTerms } from "../catalogue/QuestTerms";
import type { Tier } from "../catalogue/Tier";

export type QuestLine = {
  readonly tier: Tier;
  readonly name: string;
  readonly terms: QuestTerms;
};
