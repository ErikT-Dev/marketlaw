import { GameBoard } from "./game/GameBoard";
import type { GamePageProps } from "./game/GamePageProps";
import { LeftGamePage } from "./game/LeftGamePage";

type Props = GamePageProps;

export function GamePage(props: Props) {
  const view = props.update.game?.view;
  const mine = view?.seats.find((seat) => seat.kind === "own");
  if (view === undefined || mine?.kind !== "own") {
    return null;
  }
  if (mine.hasLeft) {
    return (
      <LeftGamePage
        result={view.result}
        turn={view.turn}
        viewer={view.seat}
        playerNames={props.update.room.playerNames}
        onExitToLobby={props.onExitToLobby}
      />
    );
  }
  return <GameBoard {...props} view={view} mine={mine} />;
}
