import type { MatchHistoryEntry } from "../../../shared/api/MatchHistoryEntry";
import { MatchHistoryRow } from "./MatchHistoryRow";
import { RecordTableHead } from "./RecordTableHead";
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
      <RecordTableHead columns={COLUMNS} />
      <tbody>
        {games.map((game) => (
          <MatchHistoryRow key={game.gameId} game={game} />
        ))}
      </tbody>
    </table>
  );
}
