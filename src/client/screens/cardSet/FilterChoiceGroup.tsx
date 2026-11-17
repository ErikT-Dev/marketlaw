import type { FilterChoice } from "./FilterChoice";
import styles from "./CardSet.module.css";

type Props<Value> = {
  readonly label: string;
  readonly choices: ReadonlyArray<FilterChoice<Value>>;
  readonly selected: Value | null;
  readonly onSelect: (value: Value | null) => void;
};

export function FilterChoiceGroup<Value>({ label, choices, selected, onSelect }: Props<Value>) {
  return (
    <div className={styles["filterGroup"]} role="group" aria-label={label}>
      <span className={styles["filterLabel"]} aria-hidden="true">
        {label}
      </span>
      {choices.map((choice) => (
        <button
          key={choice.key}
          className={styles["choice"]}
          type="button"
          aria-pressed={choice.value === selected}
          onClick={() => {
            onSelect(choice.value);
          }}
        >
          {choice.content}
        </button>
      ))}
    </div>
  );
}
