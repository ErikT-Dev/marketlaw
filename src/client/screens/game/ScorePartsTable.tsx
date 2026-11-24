import type { GameResult } from "../../../shared/GameResult";
import type { ScorePartsInHundredths } from "../../../shared/ScorePartsInHundredths";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./GameOverDialog.module.css";
import { playerNameOf } from "./playerNameOf";
import { pointsShown } from "./pointsShown";

type Props = {
  readonly result: GameResult;
  readonly viewer: SeatNumber;
  readonly playerNames: ReadonlyArray<string>;
};

const PART_COLUMNS: ReadonlyArray<readonly [keyof ScorePartsInHundredths, IconText]> = [
  ["income", [{ stat: "income" }]],
  ["workforce", [{ stat: "workforce" }]],
  ["quality", [{ stat: "quality" }]],
  ["satisfaction", [{ stat: "satisfaction" }]],
  ["product", [{ stat: "product" }]],
  ["distribution", [{ stat: "distribution" }]],
  ["fundsAndHand", [{ stat: "funds" }, " + hand"]],
  ["bonusTypes", "Bonus types"],
];

function totalOf(parts: ScorePartsInHundredths): number {
  return Object.values(parts).reduce((sum, part) => sum + part, 0);
}

export function ScorePartsTable({ result, viewer, playerNames }: Props) {
  return (
    <table className={styles["table"]}>
      <caption className={styles["caption"]}>How each score adds up</caption>
      <thead>
        <tr>
          <th scope="col">Player</th>
          {PART_COLUMNS.map(([part, header]) => (
            <th key={part} scope="col">
              <TextWithIcons text={header} />
            </th>
          ))}
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {result.places.map((place) => (
          <tr key={place.seat}>
            <th scope="row">
              {place.seat === viewer ? "You" : playerNameOf(playerNames, place.seat)}
            </th>
            {PART_COLUMNS.map(([part]) => (
              <td key={part}>{pointsShown(place.scorePartsInHundredths[part])}</td>
            ))}
            <td>{pointsShown(totalOf(place.scorePartsInHundredths))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
