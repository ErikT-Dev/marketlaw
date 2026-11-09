import type { Notice } from "../../../shared/Notice";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { Toast } from "../../components/Toast";
import type { RejectedMove } from "../../store/RejectedMove";
import styles from "./GamePage.module.css";
import { noticeToastOf } from "./noticeToastOf";
import { OpenVoteToast } from "./OpenVoteToast";
import { playerNameOf } from "./playerNameOf";
import { rejectionMessage } from "./rejectionMessage";
import { useFailedVoteNotice } from "./useFailedVoteNotice";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly timeOutNotice: Notice | null;
  readonly rejectedMove: RejectedMove | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onDismissRejection: () => void;
  readonly playerNames: ReadonlyArray<string>;
};

export function GameToasts({ view, seat, timeOutNotice, rejectedMove, ...rest }: Props) {
  const { failedVoteNextTurn, dismissFailedVote } = useFailedVoteNotice(view, !seat.hasLeft);
  const toast =
    timeOutNotice === null ? null : noticeToastOf(timeOutNotice, seat.seat, rest.playerNames);
  const vote = view.vote;
  return (
    <div className={styles["toasts"]}>
      {vote === null || vote.hasToAnswer ? null : (
        <OpenVoteToast
          vote={vote}
          callerName={
            vote.caller === view.seat ? "You" : playerNameOf(rest.playerNames, vote.caller)
          }
        />
      )}
      {failedVoteNextTurn === null ? null : (
        <Toast
          kind="info"
          title="The game goes on"
          text={`Not every player voted yes to abandon the game. The next vote is possible in turn ${String(failedVoteNextTurn)}.`}
          onClose={dismissFailedVote}
        />
      )}
      {toast === null ? null : (
        <Toast
          kind={timeOutNotice?.kind === "resumed" ? "info" : "warning"}
          title={toast.title}
          text={toast.text}
          onClose={rest.onDismissTimeOutNotice}
        />
      )}
      {rejectedMove === null ? null : (
        <Toast
          kind="error"
          title="Move rejected"
          text={rejectionMessage(rejectedMove, seat, view.nextVoteTurn)}
          onClose={rest.onDismissRejection}
        />
      )}
    </div>
  );
}
