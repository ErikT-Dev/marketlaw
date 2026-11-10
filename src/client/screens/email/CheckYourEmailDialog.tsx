import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Email.module.css";
import { EmailProblem } from "./EmailProblem";
import { useEmailRequest } from "./useEmailRequest";

type Props = {
  readonly address: string;
  readonly onSendAgain: () => Promise<ReasonCode | null>;
  readonly onClose: () => void;
};

export function CheckYourEmailDialog({ address, onSendAgain, onClose }: Props) {
  const sending = useEmailRequest();
  return (
    <Modal title="Check your email" size="large" onClose={onClose}>
      <div className={styles["body"]}>
        <p className={styles["lead"]}>
          We sent a link to {address}. Open it to confirm your address.
        </p>
        <p className={styles["text"]}>
          You can play and log in as normal now. Until you confirm, you cannot reset your password
          or join the ranked queue.
        </p>
        <p className={styles["small"]}>
          No email? Check your spam folder, or send it again. At most 3 emails a day are sent per
          account.
        </p>
        {sending.isDone ? (
          <p role="status" className={styles["text"]}>
            We sent the link again.
          </p>
        ) : null}
        <EmailProblem problem={sending.problem} />
        <div className={styles["buttons"]}>
          <Button
            look="secondary"
            loadingLabel={sending.isSending ? "Sending" : null}
            onClick={() => void sending.send(onSendAgain)}
          >
            Send it again
          </Button>
          <Button look="success" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
}
