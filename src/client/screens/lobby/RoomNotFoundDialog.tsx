import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Lobby.module.css";

type Props = {
  readonly onClose: () => void;
};

export function RoomNotFoundDialog({ onClose }: Props) {
  return (
    <Modal title="Room not found" size="large" onClose={onClose}>
      <p className={styles["small"]}>
        This room does not exist any more. Rooms are deleted when the last player leaves, or 24
        hours after their game ended.
      </p>
      <div className={styles["dialogButtons"]}>
        <Button look="primary" onClick={onClose}>
          Go to the lobby
        </Button>
      </div>
    </Modal>
  );
}
