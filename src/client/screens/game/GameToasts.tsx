import type { Notice } from "../../../shared/Notice";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { Toast } from "../../components/Toast";
import type { RejectedMove } from "../../store/RejectedMove";
import styles from "./GamePage.module.css";
import { rejectionMessage } from "./rejectionMessage";
import { timeOutText } from "./timeOutText";

type Props = {
  readonly seat: OwnSeatView;
  readonly timeOutNotice: Notice | null;
  readonly rejectedMove: RejectedMove | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onDismissRejection: () => void;
};

export function GameToasts({ seat, timeOutNotice, rejectedMove, ...dismiss }: Props) {
  return (
    <div className={styles["toasts"]}>
      {timeOutNotice === null ? null : (
        <Toast
          kind="warning"
          title="Your time ran out"
          text={timeOutText(timeOutNotice)}
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
