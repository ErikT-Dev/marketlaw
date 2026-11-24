import type { PlayerId } from "../../../shared/PlayerId";
import { useContext } from "react";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import { PlayerBadge } from "../../components/PlayerBadge";
import { SummaryCountBoxes } from "../../components/SummaryCountBoxes";
import { StatChip } from "../../components/StatChip";
import { cardsBySector } from "./cardsBySector";
import styles from "./OpponentCard.module.css";
import { sectorColor } from "../../components/sectorColor";
import { AwaySeats } from "./AwaySeats";
import { LiveBankChip } from "./LiveBankChip";
import { typesInListOrder } from "../../sorting/typesInListOrder";
import { summaryCountsOfSeat } from "./summaryCountsOfSeat";
import { TypeCountsList } from "./TypeCountsList";
import { tenthsShown } from "../../components/tenthsShown";

const MOST_PLAYED_TYPES_SHOWN = 5;

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly bonusTypes: ReadonlyArray<TypeName>;
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

export function OpponentCard({ seat, name, playerId, bonusTypes, onOpen }: Props) {
  const isAway = useContext(AwaySeats).includes(seat.seat);
  return (
    <li className={styles["item"]}>
      <article className={styles["card"]} aria-label={`Quick summary table of ${name}`}>
        <div className={styles["header"]}>
          <PlayerBadge name={name} playerId={playerId} status={statusOf(seat, isAway)} />
          <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
        </div>
        <div className={styles["stats"]}>
          <StatChip stat="funds" value={tenthsShown(seat.stats.funds)} />
          <StatChip stat="income" value={tenthsShown(seat.stats.income)} />
          <StatChip stat="influence" value={seat.stats.influence} />
          <SummaryCountBoxes counts={summaryCountsOfSeat(seat)} />
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
        <TypeCountsList
          types={typesInListOrder(seat.typeCounts, []).slice(0, MOST_PLAYED_TYPES_SHOWN)}
          typeCounts={seat.typeCounts}
          bonusTypes={bonusTypes}
          label={`Types played most by ${name}`}
        />
        <button
          className={styles["open"]}
          type="button"
          aria-label={`Detailed summary table of ${name}`}
          onClick={onOpen}
        >
          Detailed summary table ›
        </button>
      </article>
    </li>
  );
}
