import type { VoteView } from "../../../shared/VoteView";
import { Button } from "../../components/Button";
import { clockText } from "../../components/clockText";
import { Modal } from "../../components/Modal";
import { useServerNow } from "./useServerNow";
import styles from "./VoteDialog.module.css";
import { voteAnswersText } from "./voteAnswersText";

type Props = {
  readonly vote: VoteView;
  readonly callerName: string;
  readonly onAnswer: (answer: "yes" | "no") => void;
};

export function AnswerVoteDialog({ vote, callerName, onAnswer }: Props) {
  const now = useServerNow();
  return (
    <Modal title="Abandon the game?" size="large">
      <p className={styles["strong"]}>{callerName} called a vote to abandon the game.</p>
      <p className={styles["text"]}>
        If every other player votes yes, the game ends with no winner. Not answering counts as no.{" "}
        <span role="timer">{clockText(vote.deadline - now)} left to answer.</span>
      </p>
      <p className={styles["muted"]}>{voteAnswersText(vote)}</p>
      <div className={styles["buttons"]}>
        <Button
          look="danger"
          onClick={() => {
            onAnswer("no");
          }}
        >
          No, keep playing
        </Button>
        <Button
          look="success"
          onClick={() => {
            onAnswer("yes");
          }}
        >
          Yes, abandon
        </Button>
      </div>
    </Modal>
  );
}
