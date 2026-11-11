import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { PlayerId } from "../../../shared/PlayerId";
import { PlayerNameLink } from "../../components/PlayerNameLink";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import { LiveBankChip } from "./LiveBankChip";
import styles from "./OpponentBoardDialog.module.css";

type Props = {
  readonly seat: OtherSeatView;
  readonly name: string;
  readonly playerId: PlayerId | null;
};

const BOARD_STATS = [
  "funds",
  "income",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "bonus",
  "influence",
] as const satisfies ReadonlyArray<StatName>;

function turnStatus(seat: OtherSeatView): string {
  if (seat.hasLeft) {
    return "left the game";
  }
  return seat.isDone ? "done this turn" : "playing, not done yet";
}

export function OpponentStatsBox({ seat, name, playerId }: Props) {
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
      <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
      <p className={styles["status"]}>This turn: {turnStatus(seat)}</p>
    </section>
  );
}
