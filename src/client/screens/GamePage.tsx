import { useState } from "react";
import type { Notice } from "../../shared/Notice";
import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { PendingAction } from "../store/PendingAction";
import type { RejectedMove } from "../store/RejectedMove";
import styles from "./game/GamePage.module.css";
import type { ConnectionStatus } from "../../shared/ConnectionStatus";
import { AwaySeats } from "./game/AwaySeats";
import { GameOverDialog } from "./game/GameOverDialog";
import { GameNotices } from "./game/GameNotices";
import { GameTopBar } from "./game/GameTopBar";
import { LeftColumn } from "./game/LeftColumn";
import { MiddleColumn } from "./game/MiddleColumn";
import { RightColumn } from "./game/RightColumn";
import { ServerClockOffset } from "./game/ServerClockOffset";

type Props = {
  readonly update: RoomUpdate;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly rejectedMove: RejectedMove | null;
  readonly onAction: (action: ActionIntent) => void;
  readonly onDismissRejection: () => void;
  readonly serverClockOffsetMs: number;
  readonly timeOutNotice: Notice | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onExitToLobby: () => void;
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly onPlayHere: () => void;
};

export function GamePage(props: Props) {
  const { update } = props;
  const [isResultClosed, setIsResultClosed] = useState(false);
  const view = update.game?.view;
  const mine = view?.seats.find((seat) => seat.kind === "own");
  if (view === undefined || mine?.kind !== "own") {
    return null;
  }
  const playerNames = update.room.playerNames;
  return (
    <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
      <AwaySeats.Provider value={update.game?.awaySeats ?? []}>
        <div className={styles["page"]}>
          <GameTopBar view={view} seat={mine} playerNames={playerNames} />
          <main className={styles["table"]} inert={props.connection !== "open" || props.isOutdated}>
            <LeftColumn view={view} playerNames={playerNames} />
            <MiddleColumn
              view={view}
              seat={mine}
              playerNames={playerNames}
              isBusy={props.pendingActions.length > 0}
              onAction={props.onAction}
            />
            <RightColumn
              view={view}
              seat={mine}
              playerNames={playerNames}
              pendingActions={props.pendingActions}
              onAction={props.onAction}
              onShowResult={
                view.result === null
                  ? null
                  : () => {
                      setIsResultClosed(false);
                    }
              }
            />
          </main>
          {view.result === null || isResultClosed ? null : (
            <GameOverDialog
              result={view.result}
              turn={view.turn}
              viewer={view.seat}
              playerNames={playerNames}
              onExitToLobby={props.onExitToLobby}
              onClose={() => {
                setIsResultClosed(true);
              }}
            />
          )}
          <GameNotices {...props} seat={mine} playerNames={playerNames} />
        </div>
      </AwaySeats.Provider>
    </ServerClockOffset.Provider>
  );
}
