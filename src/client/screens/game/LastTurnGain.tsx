import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { iconUrl } from "../../icons/iconUrl";
import type { StatName } from "../../icons/StatName";
import styles from "./LastTurnPanel.module.css";

type Props = {
  readonly amount: string;
  readonly stat: StatName;
};

export function LastTurnGain({ amount, stat }: Props) {
  const { file, label } = STAT_ICONS[stat];
  return (
    <span className={styles["gain"]}>
      +{amount}
      <img className={styles["icon"]} src={iconUrl(file)} alt={label} />
    </span>
  );
}
