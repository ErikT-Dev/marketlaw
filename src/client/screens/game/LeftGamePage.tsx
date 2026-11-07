import { useState } from "react";
import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Button } from "../../components/Button";
import type { ChatBinding } from "../chat/ChatBinding";
import { RoomChatSection } from "../chat/RoomChatSection";
import { GameOverDialog } from "./GameOverDialog";
import styles from "./LeftGamePage.module.css";

type Props = {
  readonly result: GameResult | null;
  readonly turn: number;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly onExitToLobby: () => void;
  readonly chat: ChatBinding;
};

export function LeftGamePage(props: Props) {
  const { result, turn, viewer, playerNames, onExitToLobby } = props;
  const [isResultClosed, setIsResultClosed] = useState(false);
  return (
    <main className={styles["page"]}>
      <section className={styles["panel"]} aria-labelledby="left-game-title">
        <h1 id="left-game-title" className={styles["title"]}>
          You left the game
        </h1>
        <p className={styles["text"]}>
          {result === null
            ? "The game goes on without you. You are still in the room and its chat. When the game ends, its result appears here."
            : "The game has ended. You are still in the room and its chat."}
        </p>
        <div className={styles["buttons"]}>
          {result === null ? null : (
            <Button
              look="primary"
              onClick={() => {
                setIsResultClosed(false);
              }}
            >
              Show result
            </Button>
          )}
          <Button look="secondary" onClick={onExitToLobby}>
            Exit to lobby
          </Button>
        </div>
        <div className={styles["chat"]}>
          <RoomChatSection binding={props.chat} />
        </div>
      </section>
      {result === null || isResultClosed ? null : (
        <GameOverDialog
          result={result}
          turn={turn}
          viewer={viewer}
          playerNames={playerNames}
          onExitToLobby={onExitToLobby}
          onClose={() => {
            setIsResultClosed(true);
          }}
        />
      )}
    </main>
  );
}
