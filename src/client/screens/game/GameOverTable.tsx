import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import styles from "./GameOverDialog.module.css";
import { placeOrdinal } from "./placeOrdinal";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly result: GameResult;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
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

export function GameOverTable({ result, viewer, playerNames }: Props) {
  return (
    <>
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
        <p className={styles["note"]}>
          Players who left are placed by when they left: the one who left first is last.
        </p>
      ) : null}
    </>
  );
}
