import { useContext } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { CountBox } from "../../components/CountBox";
import { HelpButton } from "../../components/HelpButton";
import { PlayerIcon } from "../../components/PlayerIcon";
import { summaryCountEntriesOf } from "../../components/summaryCountEntriesOf";
import { COUNTS_HELP } from "./COUNTS_HELP";
import styles from "./OpponentCard.module.css";
import { playerIconOf } from "./playerIconOf";
import { PlayerIcons } from "./PlayerIcons";
import { summaryCountsOfSeat } from "./summaryCountsOfSeat";

type Props = {
  readonly seat: OwnSeatView;
  readonly name: string;
};

export function OwnCountBoxes({ seat, name }: Props) {
  const playerIcons = useContext(PlayerIcons);
  return (
    <div className={styles["ownCounts"]}>
      <span className={styles["ownName"]}>
        <PlayerIcon name="You" icon={playerIconOf(playerIcons, seat.seat)} />
        {name}
      </span>
      <div className={styles["ownCountRow"]}>
        <ul className={styles["ownCountList"]} aria-label="Your counts">
          {summaryCountEntriesOf(summaryCountsOfSeat(seat)).map((entry) => (
            <li key={entry.letter}>
              <CountBox {...entry} />
            </li>
          ))}
        </ul>
        <HelpButton name="What Q, T, C and F mean" text={COUNTS_HELP} />
      </div>
    </div>
  );
}
