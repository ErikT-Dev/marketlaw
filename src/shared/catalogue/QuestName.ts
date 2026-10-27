import type { QUEST_NAMES_BY_TIER } from "./QUEST_NAMES_BY_TIER";

export type QuestName = (typeof QUEST_NAMES_BY_TIER)[number]["names"][number];
