import type { Notice } from "../../../shared/Notice";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { IconText } from "../../components/IconText";
import { Toast } from "../../components/Toast";
import type { RejectedMove } from "../../store/RejectedMove";
import styles from "./GamePage.module.css";
import { noticeToastOf } from "./noticeToastOf";
import { OpenVoteToast } from "./OpenVoteToast";
import { playerNameOf } from "./playerNameOf";
import { rejectionMessage } from "./rejectionMessage";
import { useFailedVoteNotice } from "./useFailedVoteNotice";
import { useIncomeRiseNotice } from "./useIncomeRiseNotice";

const INCOME_RISE_TEXT: IconText = ["Your ", { stat: "income" }, " has increased!"];

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
  const { isIncomeRiseShown, dismissIncomeRise } = useIncomeRiseNotice(seat.stats.income);
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
      {isIncomeRiseShown ? (
        <Toast kind="success" title={null} text={INCOME_RISE_TEXT} onClose={dismissIncomeRise} />
      ) : null}
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
