import styles from "./Badge.module.css";

export function OutOfTimeChip() {
  return (
    <span className={`${styles["timer"] ?? ""} ${styles["low"] ?? ""}`}>
      <span className={styles["time"]}>Out of time</span>
    </span>
  );
}
