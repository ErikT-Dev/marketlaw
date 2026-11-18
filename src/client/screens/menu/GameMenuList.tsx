import { useEffect, useRef } from "react";
import type { GameMenuEntry } from "./GameMenuEntry";
import type { GameMenuItem } from "./GameMenuItem";
import styles from "./GameMenu.module.css";

type Props = {
  readonly id: string;
  readonly items: ReadonlyArray<GameMenuItem>;
  readonly onChoose: (entry: GameMenuEntry) => void;
};

export function GameMenuList({ id, items, onChoose }: Props) {
  const firstEntryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    firstEntryRef.current?.focus();
  }, []);
  return (
    <ul id={id} className={styles["menu"]} aria-label="Game menu">
      {items.map(({ entry, isAvailable }, index) => {
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
              aria-disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onChoose(entry);
                }
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
