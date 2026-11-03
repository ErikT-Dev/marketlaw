import type { Notice } from "../../../shared/Notice";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Toast } from "../../components/Toast";
import type { RejectedMove } from "../../store/RejectedMove";
import styles from "./GamePage.module.css";
import { rejectionMessage } from "./rejectionMessage";
import { noticeToastOf } from "./noticeToastOf";

type Props = {
  readonly seat: OwnSeatView;
  readonly timeOutNotice: Notice | null;
  readonly rejectedMove: RejectedMove | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onDismissRejection: () => void;
  readonly playerNames: ReadonlyArray<string>;
};

export function GameToasts({ seat, timeOutNotice, rejectedMove, playerNames, ...dismiss }: Props) {
  const toast =
    timeOutNotice === null ? null : noticeToastOf(timeOutNotice, seat.seat, playerNames);
  return (
    <div className={styles["toasts"]}>
      {toast === null ? null : (
        <Toast
          kind={timeOutNotice?.kind === "resumed" ? "info" : "warning"}
          title={toast.title}
          text={toast.text}
          onClose={dismiss.onDismissTimeOutNotice}
        />
      )}
      {rejectedMove === null ? null : (
        <Toast
          kind="error"
          title="Move rejected"
          text={rejectionMessage(rejectedMove, seat)}
          onClose={dismiss.onDismissRejection}
        />
      )}
    </div>
  );
}
