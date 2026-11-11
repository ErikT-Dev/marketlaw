import type { GameId } from "../../../shared/GameId";
import type { PlayerId } from "../../../shared/PlayerId";
import { GameRecordSummary } from "./GameRecordSummary";
import { GameRecordTable } from "./GameRecordTable";
import { RECORD_PAGE_TITLE_ID } from "./RECORD_PAGE_TITLE_ID";
import { recordDateText } from "./recordDateText";
import styles from "./Records.module.css";
import { useGameRecord } from "./useGameRecord";

type Props = {
  readonly gameId: GameId;
  readonly viewerId: PlayerId | null;
};

const PROBLEM_TEXTS = {
  loading: "Loading the game record.",
  failed: "The game record could not be loaded. Try again later.",
  not_found: "This game record does not exist.",
};

export function GameRecordContent({ gameId, viewerId }: Props) {
  const shown = useGameRecord(gameId);
  if (shown.kind !== "found") {
    return (
      <>
        <h1 id={RECORD_PAGE_TITLE_ID}>Game record</h1>
        <p className={styles["intro"]}>{PROBLEM_TEXTS[shown.kind]}</p>
      </>
    );
  }
  const { record } = shown;
  return (
    <>
      <h1 id={RECORD_PAGE_TITLE_ID}>Game record · {recordDateText(record.endedAt)}</h1>
      <GameRecordSummary record={record} />
      <GameRecordTable record={record} viewerId={viewerId} />
      {record.seats.some((seat) => seat.leftInTurn !== null) ? (
        <p className={styles["note"]}>
          Players who left are scored with their values at the moment they left.
        </p>
      ) : null}
    </>
  );
}
