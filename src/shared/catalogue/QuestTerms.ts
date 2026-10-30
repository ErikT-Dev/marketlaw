import type { QuestNeed } from "./QuestNeed";
import type { QuestReward } from "./QuestReward";

export type QuestTerms = {
  readonly needs: readonly [QuestNeed, ...QuestNeed[]];
  readonly reward: QuestReward;
};
