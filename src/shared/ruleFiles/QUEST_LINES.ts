import questFileText from "../../../harness/spec/quests.txt?raw";
import { contentsOfRuleFile } from "./contentsOfRuleFile";
import type { QuestLine } from "./QuestLine";
import { readQuestFile } from "./readQuestFile";

export const QUEST_LINES: ReadonlyArray<QuestLine> = contentsOfRuleFile(
  "quests.txt",
  readQuestFile(questFileText),
);
