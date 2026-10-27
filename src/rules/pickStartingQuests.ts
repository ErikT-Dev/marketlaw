import type { QuestName } from "../shared/catalogue/QuestName";
import { QUESTS } from "../shared/catalogue/QUESTS";
import type { Random } from "./Random";

const STARTING_QUEST_COUNT = 4;

export function pickStartingQuests(random: Random): ReadonlyArray<QuestName> {
  const tier1 = QUESTS.filter(({ tier }) => tier === 1).map(({ name }) => name);
  return Array.from({ length: STARTING_QUEST_COUNT }).reduce<ReadonlyArray<QuestName>>(
    (picked) => [...picked, random.pickQuest(tier1.filter((quest) => !picked.includes(quest)))],
    [],
  );
}
