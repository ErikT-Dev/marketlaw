import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { PlayerId } from "../../../shared/PlayerId";
import { PlayerNameLink } from "../../components/PlayerNameLink";
import { CountBox } from "../../components/CountBox";
import { StatChip } from "../../components/StatChip";
import { typeTotalOf } from "../../../shared/typeTotalOf";
import { typesInListOrder } from "../../sorting/typesInListOrder";
import { TypeCountsList } from "./TypeCountsList";
import { ClaimedCombosList } from "./ClaimedCombosList";
import { combosClaimedCountOf } from "../../../shared/combosClaimedCountOf";
import { LiveBankChip } from "./LiveBankChip";
import { OpponentBasicStats } from "./OpponentBasicStats";
import styles from "./OpponentBoardDialog.module.css";
import { tenthsShown } from "../../components/tenthsShown";
import { fundsInTenths } from "../../../shared/fundsInTenths";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly bonusTypes: ReadonlyArray<TypeName>;
};

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
        <li>
          <StatChip stat="funds" value={tenthsShown(seat.stats.funds)} />
        </li>
        <li>
          <StatChip stat="income" value={tenthsShown(fundsInTenths(seat.stats.income))} />
        </li>
        <li>
          <StatChip stat="influence" value={seat.stats.influence} />
        </li>
        <li>
          <StatChip stat="buildPasses" value={seat.buildPasses} />
        </li>
      </ul>
      <OpponentBasicStats stats={seat.stats} name={name} />
      <div className={styles["counts"]}>
        <CountBox letter="T" count={typeTotalOf(seat.typeCounts)} label="Types" />
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
