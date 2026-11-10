import { useState } from "react";
import type { ResetEmailRequest } from "../../../shared/api/ResetEmailRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Modal } from "../../components/Modal";
import { TextInput } from "../../components/TextInput";
import { DialogButtons } from "../lobby/DialogButtons";
import { HumanCheck } from "../lobby/HumanCheck";
import { useSubmitWithHumanCheck } from "../lobby/useSubmitWithHumanCheck";
import styles from "./Email.module.css";
import { ResetLinkSentDialog } from "./ResetLinkSentDialog";

type Props = {
  readonly onSend: (request: ResetEmailRequest) => Promise<ReasonCode | null>;
  readonly onClose: () => void;
};

export function ForgotPasswordDialog({ onSend, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { containerRef, humanCheckToken, isUnavailable, error, isSending, submit } =
    useSubmitWithHumanCheck();
  if (sentTo !== null) {
    return <ResetLinkSentDialog address={sentTo} onClose={onClose} />;
  }
  return (
    <Modal title="Forgot your password?" size="large" onClose={onClose}>
      <form
        noValidate
        className={styles["body"]}
        onSubmit={(event) => {
          event.preventDefault();
          const address = email.trim();
          void submit(async (humanCheck) => {
            const problem = await onSend({ email: address, humanCheck });
            if (problem === null) {
              setSentTo(address);
            }
            return problem;
          });
        }}
      >
        <p className={styles["text"]}>
          Enter the email address of your account. If it is confirmed, we send you a link to set a
          new password.
        </p>
        <TextInput
          label="Email address"
          type="email"
          value={email}
          maxLength={254}
          autoComplete="email"
          onChange={setEmail}
          error={error}
        />
        <HumanCheck containerRef={containerRef} isUnavailable={isUnavailable} />
        <DialogButtons
          submitLabel="Send link"
          sendingLabel={isSending ? "Sending" : null}
          isDisabled={humanCheckToken === "" || email.trim() === ""}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
