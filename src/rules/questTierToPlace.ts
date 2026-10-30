import type { QuestName } from "../shared/catalogue/QuestName";
import { QUESTS } from "../shared/catalogue/QUESTS";
import type { Tier } from "../shared/catalogue/Tier";
import { QUEST_TABLE_RULES } from "./QUEST_TABLE_RULES";

const TIERS = [1, 2, 3] as const;

export function questTierToPlace(
  picked: Tier,
  turn: number,
  questList: ReadonlyArray<QuestName>,
): Tier | undefined {
  const usable = TIERS.filter(
    (tier) =>
      turn >= QUEST_TABLE_RULES.firstTurnOfTier[tier] &&
      QUESTS.some(({ name, tier: questTier }) => questTier === tier && questList.includes(name)),
  );
  return [...usable].sort(
    (first, second) => Math.abs(first - picked) - Math.abs(second - picked) || first - second,
  )[0];
}
