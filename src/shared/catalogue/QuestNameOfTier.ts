import type { QUEST_NAMES_BY_TIER } from "./QUEST_NAMES_BY_TIER";
import type { Tier } from "./Tier";

export type QuestNameOfTier<T extends Tier> = Extract<
  (typeof QUEST_NAMES_BY_TIER)[number],
  { readonly tier: T }
>["names"][number];
