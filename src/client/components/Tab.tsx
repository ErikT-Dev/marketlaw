import styles from "./Tab.module.css";

type Props = {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly count?: number;
};

export function Tab({ label, isSelected, onSelect, count }: Props) {
  const hasCount = count !== undefined && count > 0;
  return (
    <button
      className={styles["tab"]}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-label={hasCount ? `${label}, ${String(count)} new` : undefined}
      onClick={onSelect}
    >
      {label}
      {hasCount ? (
        <span className={styles["count"]} aria-hidden="true">
          {count}
        </span>
      ) : null}
    </button>
  );
}
