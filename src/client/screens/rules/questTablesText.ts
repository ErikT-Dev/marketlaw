import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import type { QuestReward } from "../../../shared/catalogue/QuestReward";
import { Tier } from "../../../shared/catalogue/Tier";
import type { QuestLine } from "../../../shared/ruleFiles/QuestLine";
import { STAT_KEYS } from "../../../shared/STAT_KEYS";
import { counted } from "../game/counted";
import { questNeedLabel } from "../game/questNeedLabel";

function needText(need: QuestNeed): string {
  switch (need.kind) {
    case "type":
      return `${String(need.count)} \`${need.type}\``;
    case "income":
      return `income of ${String(need.count)}`;
    case "cards":
    case "sectors_with_tier":
    case "stat":
    case "projects":
      return `${String(need.count)} ${questNeedLabel(need)}`;
  }
}

function needsText(needs: ReadonlyArray<QuestNeed>): string {
  const texts = needs.map(needText);
  const last = texts.at(-1) ?? "";
  return texts.length < 2 ? last : `${texts.slice(0, -1).join(", ")} and ${last}`;
}

function rewardText(reward: QuestReward): string {
  const stats = STAT_KEYS.flatMap((stat) => {
    const amount = reward.stats[stat] ?? 0;
    if (amount === 0) {
      return [];
    }
    return [stat === "funds" ? `+${counted(amount, "fund")}` : `+${String(amount)} ${stat}`];
  });
  return [
    ...(reward.gainedType === null ? [] : [`gain 1 \`${reward.gainedType}\``]),
    ...stats,
    ...(reward.draws === 0 ? [] : [`draw ${counted(reward.draws, "card")}`]),
  ].join(", ");
}

function tierTableText(tier: Tier, quests: ReadonlyArray<QuestLine>): string {
  return [
    `**Tier ${String(tier)}**`,
    "",
    "| Quest | Needs | Reward |",
    "|---|---|---|",
    ...quests.map(
      ({ name, terms }) =>
        `| ${name} | ${needsText(terms.needs)} | ${rewardText(terms.reward)} |`,
    ),
  ].join("\n");
}

export function questTablesText(quests: ReadonlyArray<QuestLine>): string {
  return Tier.options
    .map((tier) => ({ tier, questsOfTier: quests.filter((quest) => quest.tier === tier) }))
    .filter(({ questsOfTier }) => questsOfTier.length > 0)
    .map(({ tier, questsOfTier }) => tierTableText(tier, questsOfTier))
    .join("\n\n");
}
