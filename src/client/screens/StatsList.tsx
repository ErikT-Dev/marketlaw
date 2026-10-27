import type { Stats } from "../../shared/Stats";
import styles from "./Screens.module.css";

type Props = {
  readonly label: string;
  readonly stats: Stats;
};

const STAT_LABELS: ReadonlyArray<readonly [keyof Stats, string]> = [
  ["funds", "Funds"],
  ["income", "Income"],
  ["influence", "Influence"],
  ["workforce", "Workforce"],
  ["quality", "Quality"],
  ["satisfaction", "Satisfaction"],
  ["product", "Product"],
  ["distribution", "Distribution"],
  ["bonus", "Bonus"],
];

export function StatsList({ label, stats }: Props) {
  return (
    <dl className={styles["stats"]} aria-label={label}>
      {STAT_LABELS.map(([stat, name]) => (
        <div key={stat}>
          <dt>{name}</dt>
          <dd>{stats[stat]}</dd>
        </div>
      ))}
    </dl>
  );
}
