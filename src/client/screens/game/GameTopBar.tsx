import { useContext } from "react";
import { Fragment } from "react";
import type { GamePhase } from "../../../shared/GamePhase";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { TURN_LIMIT } from "../../../shared/TURN_LIMIT";
import { PlayerBadge } from "../../components/PlayerBadge";
import { AwaySeats } from "./AwaySeats";
import { CallVoteButton } from "./CallVoteButton";
import styles from "./GameTopBar.module.css";
import { LeaveGameButton } from "./LeaveGameButton";
import { orderBadgesOf } from "./orderBadgesOf";
import { YourClock } from "./YourClock";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly onAction: (action: ActionIntent) => void;
  readonly isConnected: boolean;
};

const PHASE_NAMES: Readonly<Record<GamePhase, string>> = {
  market: "Market phase",
  main: "Main phase",
  ended: "Game over",
};

export function GameTopBar(props: Props) {
  const { view, seat, playerNames, isConnected } = props;
  const awaySeats = useContext(AwaySeats);
  return (
    <header className={styles["topBar"]}>
      <div className={styles["turnInfo"]}>
        <h1 className={styles["turn"]}>
          Turn {view.turn} of {TURN_LIMIT}
        </h1>
        <span className={styles[view.phase === "market" ? "marketPhase" : "phase"]}>
          {PHASE_NAMES[view.phase]}
        </span>
      </div>
      <ol className={styles["order"]} aria-label="Player order">
        {orderBadgesOf(view, playerNames, awaySeats).map((badge, index) => (
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
      <div className={styles["right"]}>
        <YourClock view={view} seat={seat} playerNames={playerNames} />
        {view.phase === "ended" ? null : (
          <>
            <CallVoteButton
              onCall={() => {
                props.onAction({ type: "call_vote" });
              }}
              isDisabled={!isConnected || view.vote !== null}
            />
            <LeaveGameButton
              onLeave={() => {
                props.onAction({ type: "leave_game" });
              }}
              isDisabled={!isConnected}
            />
          </>
        )}
      </div>
    </header>
  );
}
