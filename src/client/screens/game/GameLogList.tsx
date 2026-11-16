import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import { drawLogText } from "./drawLogText";
import styles from "./GameLogList.module.css";
import type { GameLogRow } from "./GameLogRow";
import { gameLogRows } from "./gameLogRows";
import { mainPhaseLogText } from "./mainPhaseLogText";

type Props = {
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly mainPhaseLog: ReadonlyArray<MainPhaseLogEntry>;
  readonly playerNames: ReadonlyArray<string>;
};

function rowText(row: GameLogRow, playerNames: ReadonlyArray<string>): IconText {
  return row.kind === "draws"
    ? drawLogText(row.draws, playerNames)
    : mainPhaseLogText(row.entry, playerNames);
}

function isShuffle(row: GameLogRow): boolean {
  return row.kind === "draws" && row.draws[0].kind === "shuffle";
}

export function GameLogList({ drawLog, mainPhaseLog, playerNames }: Props) {
  const newestFirst = [...gameLogRows(drawLog, mainPhaseLog)].reverse();
  if (newestFirst.length === 0) {
    return <p className={styles["empty"]}>No cards drawn yet.</p>;
  }
  return (
    <ol className={styles["log"]} aria-label="Game log entries">
      {newestFirst.map((row, index) => (
        <li
          key={String(newestFirst.length - index)}
          className={`${styles["row"] ?? ""} ${isShuffle(row) ? (styles["shuffle"] ?? "") : ""}`}
        >
          <span className={styles["turn"]}>
            <span aria-hidden="true">T{row.turn}</span>
            <span className={styles["visuallyHidden"]}>Turn {row.turn}: </span>
          </span>
          <span>
            <TextWithIcons text={rowText(row, playerNames)} />
          </span>
        </li>
      ))}
    </ol>
  );
}
