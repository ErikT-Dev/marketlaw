import * as v from "valibot";
import { QUEST_LINES } from "../ruleFiles/QUEST_LINES";

export const QuestName = v.picklist(QUEST_LINES.map(({ name }) => name));

export type QuestName = v.InferOutput<typeof QuestName>;
