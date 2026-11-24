import { useContext } from "react";
import type { PlayerView } from "../../../shared/PlayerView";
import { PlayerIcon } from "../../components/PlayerIcon";
import { iconUrl } from "../../icons/iconUrl";
import type { LastTurnBox } from "./LastTurnBox";
import { lastTurnBoxesOf } from "./lastTurnBoxesOf";
import styles from "./LastTurnPanel.module.css";
import type { LastTurnRow } from "./LastTurnRow";
import { LastTurnRowParts } from "./LastTurnRowParts";
import { playerIconOf } from "./playerIconOf";
import { PlayerIcons } from "./PlayerIcons";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
};

function rowKeyOf(row: LastTurnRow): string {
  const subject = row.kind === "quest" ? row.quest : row.kind === "project" ? row.project : "";
  return `${String(row.seat)} ${subject}`;
}

export function LastTurnPanel({ view, playerNames }: Props) {
  const playerIcons = useContext(PlayerIcons);
  const boxes = lastTurnBoxesOf(view.lastTurn);
  const isNothingNew = boxes.every(({ rows }) => rows.length === 0);
  function boxShown({ title, iconFile, rows }: LastTurnBox) {
    return (
      <div key={title} className={styles["box"]}>
        <h3 className={styles["boxTitle"]}>
          {iconFile === null ? null : (
            <img className={styles["boxIcon"]} src={iconUrl(iconFile)} alt="" />
          )}
          {title}
        </h3>
        <ul className={styles["rows"]} aria-label={title}>
          {rows.map((row) => {
            const isYou = row.seat === view.seat;
            const name = isYou ? "You" : playerNameOf(playerNames, row.seat);
            return (
              <li key={rowKeyOf(row)} className={styles["row"]}>
                <span className={styles[isYou ? "you" : "player"]}>
                  <PlayerIcon name={name} icon={playerIconOf(playerIcons, row.seat)} />
                  {name}
                </span>
                <LastTurnRowParts row={row} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  if (view.turn === 1) {
    return null;
  }
  return (
    <section className={styles["panel"]} aria-label="Last turn">
      <h2 className={styles["title"]}>Last turn · Turn {view.turn - 1}</h2>
      {isNothingNew ? (
        <p className={styles["nothing"]}>Nothing new last turn.</p>
      ) : (
        <div className={styles["boxes"]}>{boxes.map(boxShown)}</div>
      )}
    </section>
  );
}
