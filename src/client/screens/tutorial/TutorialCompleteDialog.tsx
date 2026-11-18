import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "../game/LeaveGameDialog.module.css";

type Props = {
  readonly isConnected: boolean;
  readonly onReadRules: () => void;
  readonly onPlayAgain: () => void;
  readonly onGoToLobby: () => void;
};

export function TutorialCompleteDialog(props: Props) {
  const isDisabled = !props.isConnected;
  return (
    <Modal title="Tutorial complete" size="large">
      <p className={styles["warning"]}>
        You played your first turns, got your first income and completed your first quest.
      </p>
      <p className={styles["text"]}>
        The tutorial creates no game record and does not change your rating.
      </p>
      <div className={styles["buttons"]}>
        <Button look="secondary" isDisabled={isDisabled} onClick={props.onReadRules}>
          Read the rules
        </Button>
        <Button look="secondary" isDisabled={isDisabled} onClick={props.onPlayAgain}>
          Play it again
        </Button>
        <Button look="success" isDisabled={isDisabled} onClick={props.onGoToLobby}>
          Go to the lobby
        </Button>
      </div>
    </Modal>
  );
}
