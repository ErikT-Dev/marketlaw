import { useState } from "react";
import type { EmailChangeRequest } from "../../../shared/api/EmailChangeRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Modal } from "../../components/Modal";
import { useSubmitWithHumanCheck } from "../lobby/useSubmitWithHumanCheck";
import styles from "../email/Email.module.css";
import { EmailLinkFields } from "../email/EmailLinkFields";

type Props = {
  readonly isAdding: boolean;
  readonly onSend: (change: Omit<EmailChangeRequest, "token">) => Promise<ReasonCode | null>;
  readonly onSent: () => void;
  readonly onClose: () => void;
};

export function ChangeEmailDialog({ isAdding, onSend, onSent, onClose }: Props) {
  const [email, setEmail] = useState("");
  const check = useSubmitWithHumanCheck();
  return (
    <Modal
      title={isAdding ? "Add an email address" : "Change email address"}
      size="large"
      onClose={onClose}
    >
      <form
        noValidate
        className={styles["body"]}
        onSubmit={(event) => {
          event.preventDefault();
          void check.submit(async (humanCheck) => {
            const problem = await onSend({ email: email.trim(), humanCheck });
            if (problem === null) {
              onSent();
            }
            return problem;
          });
        }}
      >
        <p className={styles["text"]}>
          {isAdding
            ? "We send a link to the new address. It is added to your account when you open it."
            : "We send a link to the new address. Your current address stays on the account until you open it."}
        </p>
        <EmailLinkFields
          label="New email address"
          email={email}
          onChangeEmail={setEmail}
          check={check}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
