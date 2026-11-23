import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { PlayerId } from "../../../shared/PlayerId";
import { PlayerNameLink } from "../../components/PlayerNameLink";
import { CountBox } from "../../components/CountBox";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import { cityTypeTotalOf } from "./cityTypeTotalOf";
import { typesInListOrder } from "../../sorting/typesInListOrder";
import { TypeCountsList } from "./TypeCountsList";
import { ClaimedCombosList } from "./ClaimedCombosList";
import { combosClaimedCountOf } from "./combosClaimedCountOf";
import { LiveBankChip } from "./LiveBankChip";
import { OpponentBasicStats } from "./OpponentBasicStats";
import styles from "./OpponentBoardDialog.module.css";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly bonusTypes: ReadonlyArray<TypeName>;
};

const BOARD_STATS = ["funds", "income", "influence"] as const satisfies ReadonlyArray<StatName>;

function turnStatus(seat: OtherSeatView): string {
  if (seat.hasLeft) {
    return "left the game";
  }
  return seat.isDone ? "done this turn" : "playing, not done yet";
}

export function OpponentStatsBox({ seat, name, playerId, bonusTypes }: Props) {
  return (
    <section className={styles["box"]} aria-label={`Stats of ${name}`}>
      <PlayerNameLink name={name} playerId={playerId} />
      <ul className={styles["stats"]}>
        {BOARD_STATS.map((stat) => (
          <li key={stat}>
            <StatChip stat={stat} value={seat.stats[stat]} />
          </li>
        ))}
        <li>
          <StatChip stat="buildPasses" value={seat.buildPasses} />
        </li>
      </ul>
      <OpponentBasicStats stats={seat.stats} name={name} />
      <div className={styles["counts"]}>
        <CountBox letter="T" count={cityTypeTotalOf(seat.city)} label="Types in their city" />
        <CountBox
          letter="C"
          count={combosClaimedCountOf(seat.combosClaimed)}
          label="Combos claimed"
        />
      </div>
      <TypeCountsList
        types={typesInListOrder(seat.typeCounts, bonusTypes)}
        typeCounts={seat.typeCounts}
        bonusTypes={bonusTypes}
        label={`Type counts of ${name}, bonus types first`}
      />
      <ClaimedCombosList combosClaimed={seat.combosClaimed} name={name} />
      <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
      <p className={styles["status"]}>This turn: {turnStatus(seat)}</p>
    </section>
  );
}
