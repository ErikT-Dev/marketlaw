import type { MatchHistoryEntry } from "../../../shared/api/MatchHistoryEntry";
import { MatchHistoryRow } from "./MatchHistoryRow";
import styles from "./Records.module.css";

type Props = {
  readonly games: ReadonlyArray<MatchHistoryEntry>;
};

const COLUMNS = [
  "Date",
  "Kind",
  "Result",
  "Place",
  "Score",
  "Winner",
  "Winner's score",
  "Players",
  "Turns",
];

export function MatchHistoryTable({ games }: Props) {
  return (
    <table className={styles["table"]} aria-label="Games">
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
        {games.map((game) => (
          <MatchHistoryRow key={game.gameId} game={game} />
        ))}
      </tbody>
    </table>
  );
}
