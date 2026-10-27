import styles from "./Tab.module.css";

type Props = {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly count?: number;
};

export function Tab({ label, isSelected, onSelect, count }: Props) {
  return (
    <button
      className={styles["tab"]}
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      {label}
      {count === undefined || count === 0 ? null : (
        <span className={styles["count"]} aria-label={`${String(count)} new`}>
          {count}
        </span>
      )}
    </button>
  );
}
