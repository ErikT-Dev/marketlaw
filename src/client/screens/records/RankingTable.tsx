import type { RankingEntry } from "../../../shared/api/RankingEntry";
import { UsernameLink } from "../../components/UsernameLink";
import { RecordTableHead } from "./RecordTableHead";
import styles from "./Records.module.css";

type Props = {
  readonly entries: ReadonlyArray<RankingEntry>;
  readonly ownPlace: number | null;
};

const COLUMNS = ["Place", "Username", "Rating", "Ranked games"];

export function RankingTable({ entries, ownPlace }: Props) {
  return (
    <table
      className={`${styles["table"] ?? ""} ${styles["rankingTable"] ?? ""}`}
      aria-label="Ranking"
    >
      <RecordTableHead columns={COLUMNS} />
      <tbody>
        {entries.map((entry) => {
          const isOwn = entry.place === ownPlace;
          return (
            <tr
              key={entry.playerId}
              className={isOwn ? styles["ownRow"] : undefined}
              aria-current={isOwn ? "true" : undefined}
            >
              <th scope="row">{entry.place}</th>
              <td>
                <UsernameLink playerId={entry.playerId} username={entry.username} />
              </td>
              <td>{entry.rating}</td>
              <td>{entry.rankedGames}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
