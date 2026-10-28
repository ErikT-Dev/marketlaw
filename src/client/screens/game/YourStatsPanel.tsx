import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Panel } from "../../components/Panel";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import styles from "./YourStatsPanel.module.css";

type Props = {
  readonly seat: OwnSeatView;
};

const SHOWN_STATS = [
  "funds",
  "income",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "bonus",
  "buildPasses",
  "influence",
] as const satisfies ReadonlyArray<StatName>;

function valueOf(seat: OwnSeatView, stat: (typeof SHOWN_STATS)[number]): number {
  return stat === "buildPasses" ? seat.buildPasses : seat.stats[stat];
}

export function YourStatsPanel({ seat }: Props) {
  return (
    <Panel title="Your stats">
      <ul className={styles["statGrid"]}>
        {SHOWN_STATS.map((stat) => (
          <li key={stat}>
            <StatChip stat={stat} value={valueOf(seat, stat)} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
