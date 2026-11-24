import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { AwaySeats } from "./AwaySeats";
import { AnswerVoteDialogIfAsked } from "./AnswerVoteDialogIfAsked";
import { GameNotices } from "./GameNotices";
import { GameOverDialog } from "./GameOverDialog";
import styles from "./GamePage.module.css";
import type { GamePageProps } from "./GamePageProps";
import { GameTable } from "./GameTable";
import { GameTopBar } from "./GameTopBar";
import { ServerClockOffset } from "./ServerClockOffset";
import { PlayerIcons } from "./PlayerIcons";

type Props = GamePageProps & {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
};

export function GameBoard(props: Props) {
  const { update, view, mine } = props;
  const playerNames = update.room.playerNames;
  return (
    <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
      <AwaySeats.Provider value={update.game?.awaySeats ?? []}>
        <div className={styles["page"]}>
          <GameTopBar
            view={view}
            seat={mine}
            playerNames={playerNames}
            playerIds={update.room.playerIds}
            onAction={props.onAction}
            account={props.account}
            isConnected={props.connection === "open"}
          />
          <PlayerIcons.Provider value={update.room.playerIcons}>
            <GameTable {...props} />
          </PlayerIcons.Provider>
          {view.result === null ? null : (
            <GameOverDialog
              result={view.result}
              turn={view.turn}
              viewer={view.seat}
              playerNames={playerNames}
              playerIds={update.room.playerIds}
              ratings={update.room.ratings}
              onExitToLobby={props.onExitToLobby}
              onClose={props.onCloseResult}
              onAskRematch={props.onAskRematch}
            />
          )}
          <AnswerVoteDialogIfAsked {...props} playerNames={playerNames} />
          <GameNotices {...props} seat={mine} playerNames={playerNames} />
        </div>
      </AwaySeats.Provider>
    </ServerClockOffset.Provider>
  );
}
