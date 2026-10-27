import type { QuestName } from "./QuestName";
import type { Tier } from "./Tier";

export type Quest = {
  readonly name: QuestName;
  readonly tier: Tier;
};
