import type { QuestName } from "../../../shared/catalogue/QuestName";
import type { QuestReward } from "../../../shared/catalogue/QuestReward";
import { questOf } from "../../../shared/ruleFiles/questOf";
import { iconUrl } from "../../icons/iconUrl";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { LastTurnGain } from "./LastTurnGain";
import styles from "./LastTurnPanel.module.css";
import type { LastTurnRow } from "./LastTurnRow";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import { QuestRewardParts } from "./QuestRewardParts";

function rewardWithFirstCompletionFunds(
  quest: QuestName,
  firstCompletionFunds: number,
): QuestReward {
  const { reward } = questOf(quest).terms;
  if (firstCompletionFunds === 0) {
    return reward;
  }
  const funds = (reward.stats.funds ?? 0) + firstCompletionFunds;
  return { ...reward, stats: { ...reward.stats, funds } };
}

type Props = {
  readonly row: LastTurnRow;
};

export function LastTurnRowParts({ row }: Props) {
  switch (row.kind) {
    case "quest":
      return (
        <>
          <span className={styles["what"]}>{row.quest}</span>
          <span className={styles["gain"]}>
            <QuestRewardParts
              reward={rewardWithFirstCompletionFunds(row.quest, row.firstCompletionFunds)}
            />
          </span>
        </>
      );
    case "project":
      return (
        <span className={styles["what"]}>
          {PROJECT_TITLES[row.project]}
          <img
            className={styles["icon"]}
            src={iconUrl(STAT_ICONS[row.project].file)}
            alt={STAT_ICONS[row.project].label}
          />
        </span>
      );
    case "income":
      return <LastTurnGain amount={String(row.income)} stat="income" />;
    case "support":
      return <LastTurnGain amount={String(row.funds)} stat="funds" />;
  }
}
