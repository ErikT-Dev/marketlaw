import styles from "./Badge.module.css";

type Props = {
  readonly label: string;
};

export function PendingMarker({ label }: Props) {
  return (
    <span className={styles["pending"]} role="status">
      {label}
    </span>
  );
}
