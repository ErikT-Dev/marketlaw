import type { PlayerId } from "../../../shared/PlayerId";
import { useContext } from "react";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import { PlayerBadge } from "../../components/PlayerBadge";
import { CountBox } from "../../components/CountBox";
import { StatChip } from "../../components/StatChip";
import { cardsBySector } from "./cardsBySector";
import styles from "./OpponentCard.module.css";
import { sectorColor } from "../../components/sectorColor";
import { AwaySeats } from "./AwaySeats";
import { LiveBankChip } from "./LiveBankChip";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly onOpen: () => void;
};

function statusOf(seat: OtherSeatView, isAway: boolean) {
  if (seat.hasLeft) {
    return "left";
  }
  if (isAway) {
    return "away";
  }
  if (seat.isDone) {
    return "done";
  }
  return seat.isOutOfTime ? "outOfTime" : "none";
}

export function OpponentCard({ seat, name, playerId, onOpen }: Props) {
  const isAway = useContext(AwaySeats).includes(seat.seat);
  return (
    <li className={styles["item"]}>
      <article className={styles["card"]} aria-label={name}>
        <div className={styles["header"]}>
          <PlayerBadge name={name} playerId={playerId} status={statusOf(seat, isAway)} />
          <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
        </div>
        <div className={styles["stats"]}>
          <StatChip stat="funds" value={seat.stats.funds} />
          <StatChip stat="income" value={seat.stats.income} />
          <StatChip stat="influence" value={seat.stats.influence} />
          <CountBox letter="Q" count={seat.questsCompleted.length} label="Quests completed" />
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
