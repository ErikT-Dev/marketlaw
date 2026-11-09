import { GameBoard } from "./game/GameBoard";
import { GameNotices } from "./game/GameNotices";
import type { GamePageProps } from "./game/GamePageProps";
import { LeftGamePage } from "./game/LeftGamePage";
import { ServerClockOffset } from "./game/ServerClockOffset";

type Props = GamePageProps;

export function GamePage(props: Props) {
  const view = props.update.game?.view;
  const mine = view?.seats.find((seat) => seat.kind === "own");
  if (view === undefined || mine?.kind !== "own") {
    return null;
  }
  if (mine.hasLeft) {
    return (
      <>
        <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
          <LeftGamePage
            result={view.result}
            turn={view.turn}
            viewer={view.seat}
            playerNames={props.update.room.playerNames}
            onExitToLobby={props.onExitToLobby}
            onCloseResult={props.onCloseResult}
            onAskRematch={props.onAskRematch}
            chat={props.chat}
          />
        </ServerClockOffset.Provider>
        <GameNotices
          {...props}
          view={view}
          seat={mine}
          playerNames={props.update.room.playerNames}
        />
      </>
    );
  }
  return <GameBoard {...props} view={view} mine={mine} />;
}
