import type { Stats } from "../../../shared/Stats";
import { StatChip } from "../../components/StatChip";
import styles from "./OpponentBoardDialog.module.css";

type Props = {
  readonly stats: Stats;
  readonly name: string;
};

const PROJECT_STATS = ["workforce", "quality", "satisfaction"] as const;

const OUTPUT_STATS = ["product", "distribution"] as const;

export function OpponentBasicStats({ stats, name }: Props) {
  const isAnyNegative = PROJECT_STATS.some((stat) => stats[stat] < 0);
  return (
    <div className={styles["basicStats"]}>
      <ul
        className={styles[isAnyNegative ? "projectStatsNegative" : "projectStats"]}
        aria-label={`Workforce, quality and satisfaction of ${name}`}
      >
        {PROJECT_STATS.map((stat) => (
          <li key={stat}>
            <StatChip stat={stat} value={stats[stat]} />
          </li>
        ))}
      </ul>
      <ul className={styles["outputStats"]}>
        {OUTPUT_STATS.map((stat) => (
          <li key={stat}>
            <StatChip stat={stat} value={stats[stat]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
