import styles from "./Badge.module.css";

type Props = {
  readonly label: string;
  readonly ms: number;
  readonly state: "normal" | "low" | "paused";
};

function clockText(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, "0")}`;
}

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
