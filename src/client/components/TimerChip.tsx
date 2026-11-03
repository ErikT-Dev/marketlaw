import styles from "./Badge.module.css";
import { clockText } from "./clockText";

type Props = {
  readonly label: string;
  readonly ms: number;
  readonly state: "normal" | "low" | "paused";
};

export function TimerChip({ label, ms, state }: Props) {
  const text = clockText(ms);
  const shownLabel = state === "paused" ? `${label} (paused)` : label;
  return (
    <span
      className={`${styles["timer"] ?? ""} ${styles[state] ?? ""}`}
      role="timer"
      aria-label={`${shownLabel} ${text}`}
    >
      <span aria-hidden="true">{shownLabel}</span>
      <span className={styles["time"]} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
