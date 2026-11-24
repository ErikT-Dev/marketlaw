import { fundsInTenths } from "../../../shared/fundsInTenths";
import { questOf } from "../../../shared/ruleFiles/questOf";
import { tenthsShown } from "../../components/tenthsShown";
import { wholeFundsShown } from "../../components/wholeFundsShown";
import { iconUrl } from "../../icons/iconUrl";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { LastTurnGain } from "./LastTurnGain";
import styles from "./LastTurnPanel.module.css";
import type { LastTurnRow } from "./LastTurnRow";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import { QuestRewardParts } from "./QuestRewardParts";

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
            <QuestRewardParts reward={questOf(row.quest).terms.reward} />
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
      return <LastTurnGain amount={tenthsShown(fundsInTenths(row.income))} stat="income" />;
    case "support":
      return <LastTurnGain amount={wholeFundsShown(row.funds)} stat="funds" />;
  }
}
