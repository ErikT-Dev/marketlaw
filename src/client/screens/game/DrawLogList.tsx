import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import styles from "./DrawLogList.module.css";
import { drawLogRows } from "./drawLogRows";
import { drawLogText } from "./drawLogText";
import { TextWithIcons } from "../../components/TextWithIcons";

type Props = {
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly playerNames: ReadonlyArray<string>;
};

export function DrawLogList({ drawLog, playerNames }: Props) {
  const newestFirst = [...drawLogRows(drawLog)].reverse();
  if (newestFirst.length === 0) {
    return <p className={styles["empty"]}>No cards drawn yet.</p>;
  }
  return (
    <ol className={styles["log"]} aria-label="Draw log entries">
      {newestFirst.map((row, index) => (
        <li
          key={String(newestFirst.length - index)}
          className={`${styles["row"] ?? ""} ${row[0].kind === "shuffle" ? (styles["shuffle"] ?? "") : ""}`}
        >
          <span className={styles["turn"]}>
            <span aria-hidden="true">T{row[0].turn}</span>
            <span className={styles["visuallyHidden"]}>Turn {row[0].turn}: </span>
          </span>
          <span>
            <TextWithIcons text={drawLogText(row, playerNames)} />
          </span>
        </li>
      ))}
    </ol>
  );
}
