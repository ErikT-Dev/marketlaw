import type { PlayerId } from "../../../shared/PlayerId";
import { Button } from "../../components/Button";
import { goBack } from "../../components/goBack";
import { useOverlayPage } from "../../components/useOverlayPage";
import { GameRecordContent } from "./GameRecordContent";
import { MatchHistoryContent } from "./MatchHistoryContent";
import { RECORD_PAGE_TITLE_ID } from "./RECORD_PAGE_TITLE_ID";
import type { RecordPage } from "./RecordPage";
import styles from "./Records.module.css";

type Props = {
  readonly page: RecordPage;
  readonly viewerId: PlayerId | null;
};

export function RecordsPage({ page, viewerId }: Props) {
  const pageRef = useOverlayPage();
  return (
    <div
      ref={pageRef}
      tabIndex={-1}
      className={styles["page"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby={RECORD_PAGE_TITLE_ID}
    >
      <article className={styles["panel"]}>
        <div>
          <Button look="secondary" onClick={goBack}>
            Back
          </Button>
        </div>
        {page.kind === "history" ? (
          <MatchHistoryContent playerId={page.playerId} isOwn={page.playerId === viewerId} />
        ) : (
          <GameRecordContent gameId={page.gameId} viewerId={viewerId} />
        )}
      </article>
    </div>
  );
}
