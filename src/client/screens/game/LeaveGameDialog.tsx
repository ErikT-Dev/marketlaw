import { Button } from "../../components/Button";
import type { LeaveDialogProps } from "../../components/LeaveDialogProps";
import { Modal } from "../../components/Modal";
import styles from "./LeaveGameDialog.module.css";

type Props = LeaveDialogProps;

export function LeaveGameDialog({ onStay, onLeave }: Props) {
  return (
    <Modal title="Leave the game?" size="large" onClose={onStay}>
      <p className={styles["warning"]}>
        If you leave, you cannot come back and cannot win. The game goes on without you.
      </p>
      <p className={styles["text"]}>
        Your city stays, your hand goes to the discard pile, and you are placed below every player
        who stays. You stay in the room and its chat, and you can join another room or the ranked
        queue straight away.
      </p>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onStay}>
          Stay in the game
        </Button>
        <Button look="danger" onClick={onLeave}>
          Leave the game
        </Button>
      </div>
    </Modal>
  );
}
