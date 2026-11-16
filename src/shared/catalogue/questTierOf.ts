import type { QuestName } from "./QuestName";
import { QUESTS } from "./QUESTS";
import type { Tier } from "./Tier";

export function questTierOf(name: QuestName): Tier {
  const quest = QUESTS.find((candidate) => candidate.name === name);
  if (quest === undefined) {
    throw new Error(`no quest named ${name}`);
  }
  return quest.tier;
}
