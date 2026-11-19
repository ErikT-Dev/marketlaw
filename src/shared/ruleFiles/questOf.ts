import type { QuestLine } from "./QuestLine";
import { QUEST_LINES } from "./QUEST_LINES";

export function questOf(name: string): QuestLine {
  const quest = QUEST_LINES.find((candidate) => candidate.name === name);
  if (quest === undefined) {
    throw new Error(`no quest named ${name}`);
  }
  return quest;
}
