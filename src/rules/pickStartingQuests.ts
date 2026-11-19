import type { QuestName } from "../shared/catalogue/QuestName";
import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import type { Random } from "./Random";

const STARTING_QUEST_COUNT = 4;

export function pickStartingQuests(random: Random): ReadonlyArray<QuestName> {
  const tier1 = QUEST_LINES.filter(({ tier }) => tier === 1).map(({ name }) => name);
  return Array.from({ length: STARTING_QUEST_COUNT }).reduce<ReadonlyArray<QuestName>>(
    (picked) => [...picked, random.pickQuest(tier1.filter((quest) => !picked.includes(quest)))],
    [],
  );
}
