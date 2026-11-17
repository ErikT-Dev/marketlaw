import { useEffect, useRef } from "react";
import type { GameMenuEntry } from "./GameMenuEntry";
import styles from "./GameMenu.module.css";

type Props = {
  readonly id: string;
  readonly entries: ReadonlyArray<GameMenuEntry>;
  readonly onChoose: (entry: GameMenuEntry) => void;
};

export function GameMenuList({ id, entries, onChoose }: Props) {
  const firstEntryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    firstEntryRef.current?.focus();
  }, []);
  return (
    <ul id={id} className={styles["menu"]} aria-label="Game menu">
      {entries.map((entry, index) => {
        const labelId = `${id}-label-${String(index)}`;
        const lineId = `${id}-line-${String(index)}`;
        return (
          <li key={entry.label}>
            <button
              ref={index === 0 ? firstEntryRef : undefined}
              type="button"
              className={styles["entry"]}
              aria-labelledby={labelId}
              aria-describedby={lineId}
              onClick={() => {
                onChoose(entry);
              }}
            >
              <span id={labelId} className={styles["label"]}>
                {entry.label}
              </span>
              <span id={lineId} className={styles["line"]}>
                {entry.line}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
