import styles from "./CountBox.module.css";

type Props = {
  readonly letter: "Q" | "T" | "C";
  readonly count: number;
  readonly label: string;
};

const LETTER_CLASSES = {
  Q: "quests",
  T: "types",
  C: "combos",
} as const satisfies Record<Props["letter"], string>;

export function CountBox({ letter, count, label }: Props) {
  return (
    <span className={styles["box"]} role="img" aria-label={`${label} ${String(count)}`}>
      <strong className={styles[LETTER_CLASSES[letter]]} aria-hidden="true">
        {letter}
      </strong>
      <span aria-hidden="true">{count}</span>
    </span>
  );
}
