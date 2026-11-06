import type { GameResult } from "../../../shared/GameResult";
import { isAbandoned } from "../../../shared/isAbandoned";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./GameOverDialog.module.css";
import { GameOverTable } from "./GameOverTable";
import { gameOverTexts } from "./gameOverTexts";
import { playerNameOf } from "./playerNameOf";
import { TextWithIcons } from "../../components/TextWithIcons";

type Props = {
  readonly result: GameResult;
  readonly turn: number;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly onExitToLobby: () => void;
  readonly onClose: () => void;
};

export function GameOverDialog(props: Props) {
  const { result, turn, viewer, playerNames } = props;
  const { title, why } = gameOverTexts(
    result,
    turn,
    (seat) => playerNameOf(playerNames, seat),
    viewer,
  );
  const hasTable = !isAbandoned(result.endedBy);
  return (
    <Modal title={title} size={hasTable ? "extraLarge" : "large"} onClose={props.onClose}>
      <p className={styles["why"]}>
        <TextWithIcons text={why} />
      </p>
      {hasTable ? (
        <GameOverTable result={result} viewer={viewer} playerNames={playerNames} />
      ) : null}
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={props.onExitToLobby}>
          Exit to lobby
        </Button>
        <Button look="success" onClick={props.onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
