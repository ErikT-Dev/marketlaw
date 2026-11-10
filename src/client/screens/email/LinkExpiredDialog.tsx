import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./Email.module.css";
import { EmailProblem } from "./EmailProblem";
import { useEmailRequest } from "./useEmailRequest";

type Props = {
  readonly unconfirmedAddress: string | null;
  readonly onSendAgain: (address: string) => Promise<ReasonCode | null>;
  readonly onForgotPassword: () => void;
  readonly onClose: () => void;
};

export function LinkExpiredDialog(props: Props) {
  const { unconfirmedAddress, onSendAgain, onForgotPassword, onClose } = props;
  const sending = useEmailRequest();
  return (
    <Modal title="This link no longer works" size="large" onClose={onClose}>
      <div className={styles["body"]}>
        <p className={styles["text"]}>
          The link has expired or was already used. Ask for a new one.
        </p>
        <EmailProblem problem={sending.problem} />
        <div className={styles["buttons"]}>
          <Button look="secondary" onClick={onClose}>
            Close
          </Button>
          {unconfirmedAddress === null ? (
            <Button look="primary" onClick={onForgotPassword}>
              Forgot password
            </Button>
          ) : (
            <Button
              look="primary"
              loadingLabel={sending.isSending ? "Sending" : null}
              onClick={() => void sending.send(async () => onSendAgain(unconfirmedAddress))}
            >
              Send it again
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
