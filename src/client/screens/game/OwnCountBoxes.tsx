import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { CountBox } from "../../components/CountBox";
import { HelpButton } from "../../components/HelpButton";
import { summaryCountEntriesOf } from "../../components/summaryCountEntriesOf";
import { COUNTS_HELP } from "./COUNTS_HELP";
import styles from "./OpponentCard.module.css";
import { summaryCountsOfSeat } from "./summaryCountsOfSeat";

type Props = {
  readonly seat: OwnSeatView;
};

export function OwnCountBoxes({ seat }: Props) {
  return (
    <div className={styles["ownCounts"]}>
      <ul className={styles["ownCountList"]} aria-label="Your counts">
        {summaryCountEntriesOf(summaryCountsOfSeat(seat)).map((entry) => (
          <li key={entry.letter}>
            <CountBox {...entry} />
          </li>
        ))}
      </ul>
      <HelpButton name="What Q, T, C and F mean" text={COUNTS_HELP} />
    </div>
  );
}
