import type { GameRecordView } from "../../../shared/api/GameRecordView";
import { TypeChip } from "../../components/TypeChip";
import { gameTimesText } from "./gameTimesText";
import { RecordNameLink } from "./RecordNameLink";
import styles from "./Records.module.css";

type Props = {
  readonly record: GameRecordView;
};

export function GameRecordSummary({ record }: Props) {
  const winner = record.seats.find((seat) => seat.seat === record.winner);
  return (
    <p className={styles["intro"]}>
      {record.kind === "ranked" ? "Ranked game" : "Casual game"} · {gameTimesText(record)} ·{" "}
      {record.turns} {record.turns === 1 ? "turn" : "turns"} · winner{" "}
      {winner === undefined ? "unknown" : <RecordNameLink name={winner.player} />} · bonus types:{" "}
      {record.bonusTypes.map((type) => (
        <TypeChip key={type} type={type} />
      ))}
    </p>
  );
}
