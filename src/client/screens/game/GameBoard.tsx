import { useState } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { AwaySeats } from "./AwaySeats";
import { GameNotices } from "./GameNotices";
import { GameOverDialog } from "./GameOverDialog";
import styles from "./GamePage.module.css";
import type { GamePageProps } from "./GamePageProps";
import { GameTopBar } from "./GameTopBar";
import { LeftColumn } from "./LeftColumn";
import { MiddleColumn } from "./MiddleColumn";
import { RightColumn } from "./RightColumn";
import { ServerClockOffset } from "./ServerClockOffset";

type Props = GamePageProps & {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
};

export function GameBoard(props: Props) {
  const { update, view, mine } = props;
  const [isResultClosed, setIsResultClosed] = useState(false);
  const playerNames = update.room.playerNames;
  return (
    <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
      <AwaySeats.Provider value={update.game?.awaySeats ?? []}>
        <div className={styles["page"]}>
          <GameTopBar
            view={view}
            seat={mine}
            playerNames={playerNames}
            onLeaveGame={() => {
              props.onAction({ type: "leave_game" });
            }}
            isConnected={props.connection === "open"}
          />
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
