import { playerIdOf } from "./playerIdOf";
import { PlayerNameLink } from "../../components/PlayerNameLink";
import type { PlayerId } from "../../../shared/PlayerId";
import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { SeatRatingView } from "../../../shared/protocol/SeatRatingView";
import type { IconText } from "../../components/IconText";
import { SummaryCountBoxes } from "../../components/SummaryCountBoxes";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./GameOverDialog.module.css";
import { placeOrdinal } from "./placeOrdinal";
import { playerNameOf } from "./playerNameOf";
import { RatingCell } from "./RatingCell";
import { ScorePartsTable } from "./ScorePartsTable";

type Props = {
  readonly result: GameResult;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
  readonly playerIds: ReadonlyArray<PlayerId>;
  readonly ratings: ReadonlyArray<SeatRatingView> | null;
};

const COLUMNS: ReadonlyArray<IconText> = [
  "Place",
  "Player",
  "Result",
  "Score",
  "End goal",
  "Q, T, C, F",
];

export function GameOverTable({ result, viewer, playerNames, playerIds, ratings }: Props) {
  const columns = ratings === null ? COLUMNS : [...COLUMNS, "Rating"];
  return (
    <>
      <table className={styles["table"]} aria-label="Places">
        <thead>
          <tr>
            {columns.map((column, index) => (
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
                {place.seat === viewer ? (
                  "You"
                ) : (
                  <PlayerNameLink
                    name={playerNameOf(playerNames, place.seat)}
                    playerId={playerIdOf(playerIds, place.seat)}
                  />
                )}
              </th>
              <td>{place.leftInTurn !== null ? "left" : index === 0 ? "won" : "lost"}</td>
              <td>{place.score}</td>
              <td>{place.hasReachedEndGoal ? "yes" : "no"}</td>
              <td className={styles["counts"]}>
                <SummaryCountBoxes counts={place.counts} />
              </td>
              {ratings === null ? null : (
                <RatingCell rating={ratings.find((rating) => rating.seat === place.seat)} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles["note"]}>
        Players who reached the end goal place first, then the higher score, then the higher total
        worth gained (F), then the earlier place in the final turn&apos;s player order.
      </p>
      <ScorePartsTable result={result} viewer={viewer} playerNames={playerNames} />
      <p className={styles["note"]}>The score is the total rounded down.</p>
      {result.places.some((place) => place.leftInTurn !== null) ? (
        <p className={styles["note"]}>
          Players who left are placed by when they left: the one who left first is last.
        </p>
      ) : null}
      {ratings === null ? null : (
        <p className={styles["note"]}>
          Each pair of players counts as one result. A rematch of a ranked game is casual.
        </p>
      )}
    </>
  );
}
