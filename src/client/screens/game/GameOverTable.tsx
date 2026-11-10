import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./GameOverDialog.module.css";
import { placeOrdinal } from "./placeOrdinal";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly result: GameResult;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
};

const COLUMNS: ReadonlyArray<IconText> = [
  "Place",
  "Player",
  "Result",
  "Score",
  "End goal",
  [{ stat: "income" }],
  [{ stat: "funds" }, " + hand"],
  "Bonus-type pts",
];

export function GameOverTable({ result, viewer, playerNames }: Props) {
  return (
    <>
      <table className={styles["table"]}>
        <thead>
          <tr>
            {COLUMNS.map((column, index) => (
              <th key={index} scope="col">
                <TextWithIcons text={column} />
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
              <td>{place.leftInTurn !== null ? "left" : index === 0 ? "won" : "lost"}</td>
              <td>{place.score}</td>
              <td>{place.hasReachedEndGoal ? "yes" : "no"}</td>
              <td>{place.income}</td>
              <td>{place.fundsAndHand}</td>
              <td>{place.bonusTypePoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.places.some((place) => place.leftInTurn !== null) ? (
        <p className={styles["note"]}>
          Players who left are placed by when they left: the one who left first is last.
        </p>
      ) : null}
    </>
  );
}
