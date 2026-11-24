import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import { SummaryCountBoxes } from "../../components/SummaryCountBoxes";
import styles from "./Records.module.css";

type Props = {
  readonly seat: GameRecordSeat;
};

export function RecordedCounts({ seat }: Props) {
  return seat.counts === null ? (
    "not recorded"
  ) : (
    <span className={styles["counts"]}>
      <SummaryCountBoxes counts={seat.counts} />
    </span>
  );
}
