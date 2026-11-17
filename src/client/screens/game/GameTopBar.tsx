import { playerIdOf } from "./playerIdOf";
import type { PlayerId } from "../../../shared/PlayerId";
import { useContext } from "react";
import { Fragment } from "react";
import type { GamePhase } from "../../../shared/GamePhase";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { TURN_LIMIT } from "../../../shared/TURN_LIMIT";
import { PlayerBadge } from "../../components/PlayerBadge";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { AwaySeats } from "./AwaySeats";
import { CallVoteButton } from "./CallVoteButton";
import styles from "./GameTopBar.module.css";
import { LeaveGameButton } from "./LeaveGameButton";
import { orderBadgesOf } from "./orderBadgesOf";
import { YourClock } from "./YourClock";
import { GameMenu } from "../menu/GameMenu";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly playerIds: ReadonlyArray<PlayerId>;
  readonly onAction: (action: ActionIntent) => void;
  readonly isConnected: boolean;
  readonly account: AccountBinding;
};

const PHASE_NAMES: Readonly<Record<GamePhase, string>> = {
  market: "Market phase",
  main: "Main phase",
  ended: "Game over",
};

function phaseClassOf(view: PlayerView): string {
  if (view.phase !== "market") {
    return "phase";
  }
  return view.marketGo === view.seat ? "yourGoPhase" : "marketPhase";
}

export function GameTopBar(props: Props) {
  const { view, seat, playerNames, isConnected } = props;
  const awaySeats = useContext(AwaySeats);
  return (
    <header className={styles["topBar"]}>
      <div className={styles["turnInfo"]}>
        <GameMenu place="game" buttonLabel="Menu" />
        <h1 className={styles["turn"]}>
          Turn {view.turn} of {TURN_LIMIT}
        </h1>
        <span className={styles[phaseClassOf(view)]}>{PHASE_NAMES[view.phase]}</span>
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
                playerId={playerIdOf(props.playerIds, badge.seat)}
                status={badge.status}
                isFirstPlayer={badge.isFirstPlayer}
              />
            </li>
          </Fragment>
        ))}
      </ol>
      <div className={styles["right"]}>
        <UserAccount account={props.account} rating={null} />
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
