import * as v from "valibot";
import { QUEST_NAMES_BY_TIER } from "./QUEST_NAMES_BY_TIER";

export const QuestName = v.picklist(QUEST_NAMES_BY_TIER.flatMap(({ names }) => names));

export type QuestName = (typeof QUEST_NAMES_BY_TIER)[number]["names"][number];
