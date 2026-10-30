import { Fragment } from "react";
import type { GamePhase } from "../../../shared/GamePhase";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { TURN_LIMIT } from "../../../shared/TURN_LIMIT";
import { PlayerBadge } from "../../components/PlayerBadge";
import styles from "./GameTopBar.module.css";
import { orderBadgesOf } from "./orderBadgesOf";
import { YourClock } from "./YourClock";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
};

const PHASE_NAMES: Readonly<Record<GamePhase, string>> = {
  market: "Market phase",
  main: "Main phase",
  ended: "Game over",
};

export function GameTopBar({ view, seat, playerNames }: Props) {
  return (
    <header className={styles["topBar"]}>
      <div className={styles["turnInfo"]}>
        <h1 className={styles["turn"]}>
          Turn {view.turn} of {TURN_LIMIT}
        </h1>
        <span className={styles["phase"]}>{PHASE_NAMES[view.phase]}</span>
      </div>
      <ol className={styles["order"]} aria-label="Player order">
        {orderBadgesOf(view, playerNames).map((badge, index) => (
          <Fragment key={badge.seat}>
            {index === 0 ? null : (
              <li className={styles["arrow"]} aria-hidden="true">
                ›
              </li>
            )}
            <li>
              <PlayerBadge
                name={badge.name}
                status={badge.status}
                isFirstPlayer={badge.isFirstPlayer}
              />
            </li>
          </Fragment>
        ))}
      </ol>
      <YourClock view={view} seat={seat} playerNames={playerNames} />
    </header>
  );
}
