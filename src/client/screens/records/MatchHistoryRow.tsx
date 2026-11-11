import type { MatchHistoryEntry } from "../../../shared/api/MatchHistoryEntry";
import { gameRecordHash } from "./gameRecordHash";
import { placeOfText } from "./placeOfText";
import { RecordNameLink } from "./RecordNameLink";
import { recordDateText } from "./recordDateText";
import styles from "./Records.module.css";

type Props = {
  readonly game: MatchHistoryEntry;
};

export function MatchHistoryRow({ game }: Props) {
  return (
    <tr>
      <th scope="row">
        <a className={styles["gameLink"]} href={gameRecordHash(game.gameId)}>
          {recordDateText(game.endedAt)}
        </a>
      </th>
      <td className={styles[game.kind]}>{game.kind === "ranked" ? "Ranked" : "Casual"}</td>
      <td className={styles[game.result]}>{game.result}</td>
      <td>{placeOfText(game.place, game.players)}</td>
      <td>{game.score}</td>
      <td>
        <RecordNameLink name={game.winner} />
      </td>
      <td>{game.winnerScore}</td>
      <td>{game.players}</td>
      <td>{game.turns}</td>
    </tr>
  );
}
