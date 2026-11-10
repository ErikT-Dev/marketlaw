import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Email.module.css";

type Props = {
  readonly onClose: () => void;
};

export function EmailConfirmedDialog({ onClose }: Props) {
  return (
    <Modal title="Email address confirmed" size="large" onClose={onClose}>
      <div className={styles["body"]}>
        <p className={styles["text"]}>
          Your email address is now confirmed. You can join the ranked queue and reset your password
          if you forget it.
        </p>
        <div className={styles["buttons"]}>
          <Button look="success" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
}
