import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./VoteDialog.module.css";

type Props = {
  readonly onCancel: () => void;
  readonly onCall: () => void;
};

export function CallVoteDialog({ onCancel, onCall }: Props) {
  return (
    <Modal title="Call a vote to abandon the game?" size="large" onClose={onCancel}>
      <p className={styles["text"]}>
        Every other player still in the game gets 1 minute to answer. If all of them vote yes, the
        game ends with no winner and no game record. Anyone who does not answer counts as no.
      </p>
      <p className={styles["muted"]}>
        A game can have one vote every 5 turns. Ranked games cannot be abandoned by vote. All clocks
        keep running during the vote.
      </p>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button look="warning" onClick={onCall}>
          Call the vote
        </Button>
      </div>
    </Modal>
  );
}
