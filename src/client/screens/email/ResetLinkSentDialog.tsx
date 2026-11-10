import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Email.module.css";

type Props = {
  readonly address: string;
  readonly onClose: () => void;
};

export function ResetLinkSentDialog({ address, onClose }: Props) {
  return (
    <Modal title="Check your email" size="large" onClose={onClose}>
      <div className={styles["body"]}>
        <p className={styles["lead"]}>We sent a link to {address}.</p>
        <p className={styles["text"]}>
          Open it within 1 hour to set a new password. No email? Check your spam folder.
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
