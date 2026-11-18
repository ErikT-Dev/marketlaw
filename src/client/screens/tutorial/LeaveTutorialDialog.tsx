import { Button } from "../../components/Button";
import type { LeaveDialogProps } from "../../components/LeaveDialogProps";
import { Modal } from "../../components/Modal";
import styles from "../game/LeaveGameDialog.module.css";

type Props = LeaveDialogProps;

export function LeaveTutorialDialog({ onStay, onLeave }: Props) {
  return (
    <Modal title="Leave the tutorial?" size="large" onClose={onStay}>
      <p className={styles["text"]}>
        Your progress in the tutorial is lost. You can start it again from the beginning any time
        from the game menu.
      </p>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onStay}>
          Stay
        </Button>
        <Button look="danger" onClick={onLeave}>
          Leave tutorial
        </Button>
      </div>
    </Modal>
  );
}
