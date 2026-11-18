import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { CountBox } from "../../components/CountBox";
import { cityTypeTotalOf } from "./cityTypeTotalOf";
import styles from "./YourStatsPanel.module.css";

type Props = {
  readonly seat: OwnSeatView;
};

export function OwnCountBoxes({ seat }: Props) {
  const combosClaimed = seat.combos.reduce((total, { claimedTimes }) => total + claimedTimes, 0);
  return (
    <ul className={styles["counts"]} aria-label="Your counts">
      <li>
        <CountBox letter="Q" count={seat.questsCompleted.length} label="Quests completed" />
      </li>
      <li>
        <CountBox letter="T" count={cityTypeTotalOf(seat.city)} label="Types in your city" />
      </li>
      <li>
        <CountBox letter="C" count={combosClaimed} label="Combos claimed" />
      </li>
      <li>
        <CountBox letter="F" count={seat.worthGained} label="Total worth gained" />
      </li>
    </ul>
  );
}
