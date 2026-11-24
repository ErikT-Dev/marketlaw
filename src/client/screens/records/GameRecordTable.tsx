import type { GameRecordView } from "../../../shared/api/GameRecordView";
import type { PlayerId } from "../../../shared/PlayerId";
import { TextWithIcons } from "../../components/TextWithIcons";
import { gameRecordRowsOf } from "./gameRecordRowsOf";
import { RecordNameLink } from "./RecordNameLink";
import styles from "./Records.module.css";

type Props = {
  readonly record: GameRecordView;
  readonly viewerId: PlayerId | null;
};

export function GameRecordTable({ record, viewerId }: Props) {
  return (
    <table className={styles["table"]} aria-label="Players">
      <thead>
        <tr>
          <th scope="col">Player</th>
          {record.seats.map((seat) => (
            <th key={seat.seat} scope="col">
              <RecordNameLink name={seat.player} />
              {seat.player.kind === "player" && seat.player.playerId === viewerId ? " (you)" : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {gameRecordRowsOf(record).map((row, index) => (
          <tr key={index}>
            <th scope="row">
              <TextWithIcons text={row.label} />
            </th>
            {record.seats.map((seat) => (
              <td key={seat.seat} className={index === 0 ? styles[seat.result] : undefined}>
                {row.valueOf(seat)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
