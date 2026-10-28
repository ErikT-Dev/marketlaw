import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import { Panel } from "../../components/Panel";
import styles from "./DrawLogPanel.module.css";
import { drawLogText } from "./drawLogText";

type Props = {
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly playerNames: ReadonlyArray<string>;
};

export function DrawLogPanel({ drawLog, playerNames }: Props) {
  const newestFirst = [...drawLog].reverse();
  return (
    <Panel title="Draw log">
      {newestFirst.length === 0 ? (
        <p className={styles["empty"]}>No cards drawn yet.</p>
      ) : (
        <ol className={styles["log"]} aria-label="Draw log entries">
          {newestFirst.map((entry, index) => (
            <li
              key={String(drawLog.length - index)}
              className={`${styles["row"] ?? ""} ${entry.kind === "shuffle" ? (styles["shuffle"] ?? "") : ""}`}
            >
              <span className={styles["turn"]} aria-label={`Turn ${String(entry.turn)}`}>
                T{entry.turn}
              </span>
              <span>{drawLogText(entry, playerNames)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
