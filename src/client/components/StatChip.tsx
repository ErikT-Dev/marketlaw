import { iconUrl } from "../icons/iconUrl";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import type { StatName } from "../icons/StatName";
import styles from "./Chip.module.css";

type Props = {
  readonly stat: StatName;
  readonly value: number | string;
};

export function StatChip({ stat, value }: Props) {
  const { file, label } = STAT_ICONS[stat];
  return (
    <span className={styles["chip"]} role="img" aria-label={`${label} ${String(value)}`}>
      <img className={styles["icon"]} src={iconUrl(file)} alt="" />
      <span
        aria-hidden="true"
        style={{
          color: `color-mix(in srgb, var(--color-stat-${stat === "buildPasses" ? "build-pass" : stat}) 35%, white)`,
        }}
      >
        {value}
      </span>
      <span className={styles["tooltip"]} aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
