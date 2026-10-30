import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./GameOverDialog.module.css";
import { gameOverTexts } from "./gameOverTexts";
import { placeOrdinal } from "./placeOrdinal";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly result: GameResult;
  readonly turn: number;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly onExitToLobby: () => void;
  readonly onClose: () => void;
};

const COLUMNS = [
  "Place",
  "Player",
  "Result",
  "Score",
  "End goal",
  "Income",
  "Funds + hand",
  "Bonus-type pts",
];

export function GameOverDialog(props: Props) {
  const { result, turn, viewer, playerNames } = props;
  const { title, why } = gameOverTexts(result, turn, (seat) => playerNameOf(playerNames, seat));
  return (
    <Modal title={title} size="extraLarge" onClose={props.onClose}>
      <p className={styles["why"]}>{why}</p>
      <table className={styles["table"]}>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.places.map((place, index) => (
            <tr key={place.seat} className={index === 0 ? styles["winner"] : undefined}>
              <td>{placeOrdinal(index)}</td>
              <th scope="row">
                {place.seat === viewer ? "You" : playerNameOf(playerNames, place.seat)}
              </th>
              <td>{place.hasLeft ? "left" : index === 0 ? "won" : "lost"}</td>
              <td>{place.score}</td>
              <td>{place.hasReachedEndGoal ? "yes" : "no"}</td>
              <td>{place.income}</td>
              <td>{place.fundsAndHand}</td>
              <td>{place.bonusTypePoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.places.some((place) => place.hasLeft) ? (
        <p className={styles["note"]}>Players who left are placed last.</p>
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
