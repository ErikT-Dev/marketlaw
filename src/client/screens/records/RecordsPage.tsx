import type { PlayerId } from "../../../shared/PlayerId";
import { Button } from "../../components/Button";
import { goBack } from "../../components/goBack";
import { useOverlayPage } from "../../components/useOverlayPage";
import { RECORD_PAGE_TITLE_ID } from "./RECORD_PAGE_TITLE_ID";
import type { RecordPage } from "./RecordPage";
import { RecordPageContent } from "./RecordPageContent";
import styles from "./Records.module.css";

type Props = {
  readonly page: RecordPage;
  readonly viewerId: PlayerId | null;
  readonly token: string | null;
};

export function RecordsPage(props: Props) {
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
        <RecordPageContent {...props} />
      </article>
    </div>
  );
}
