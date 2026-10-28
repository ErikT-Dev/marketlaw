import type { OtherSeatView } from "../../../shared/OtherSeatView";
import { PlayerBadge } from "../../components/PlayerBadge";
import { StatChip } from "../../components/StatChip";
import { TimerChip } from "../../components/TimerChip";
import { cardsBySector } from "./cardsBySector";
import styles from "./OpponentCard.module.css";
import { sectorColor } from "../../components/sectorColor";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly onOpen: () => void;
};

function statusOf(seat: OtherSeatView) {
  if (seat.hasLeft) {
    return "left";
  }
  return seat.isDone ? "done" : "none";
}

export function OpponentCard({ seat, name, onOpen }: Props) {
  return (
    <li className={styles["item"]}>
      <article className={styles["card"]} aria-label={name}>
        <div className={styles["header"]}>
          <PlayerBadge name={name} status={statusOf(seat)} />
          <TimerChip label="Bank" ms={seat.timeBankMs} state="normal" />
        </div>
        <div className={styles["stats"]}>
          <StatChip stat="funds" value={seat.stats.funds} />
          <StatChip stat="income" value={seat.stats.income} />
          <span className={styles["hand"]}>Hand {seat.handCount}</span>
        </div>
        <ul className={styles["sectors"]} aria-label={`Cards in play of ${name}`}>
          {cardsBySector(seat.city).map(({ sector, cards }) => (
            <li
              key={sector}
              className={styles["sector"]}
              style={{ background: sectorColor(sector, 2) }}
            >
              {sector} <strong>{cards.length}</strong>
            </li>
          ))}
        </ul>
        <button className={styles["open"]} type="button" onClick={onOpen}>
          See {name}&apos;s board ›
        </button>
      </article>
    </li>
  );
}
