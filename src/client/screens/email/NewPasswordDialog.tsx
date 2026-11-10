import { useState } from "react";
import type { NewPasswordRequest } from "../../../shared/api/NewPasswordRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { TextInput } from "../../components/TextInput";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import styles from "./Email.module.css";
import { EmailProblem } from "./EmailProblem";
import { useEmailRequest } from "./useEmailRequest";

type Props = {
  readonly link: string;
  readonly onSubmit: (request: NewPasswordRequest) => Promise<ReasonCode | null>;
  readonly onClose: () => void;
};

const NOT_THE_SAME = "The two passwords are not the same.";

export function NewPasswordDialog({ link, onSubmit, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [isMismatchShown, setIsMismatchShown] = useState(false);
  const sending = useEmailRequest();
  const isPasswordProblem = sending.problem === "password_invalid";
  return (
    <Modal title="Set a new password" size="large" onClose={onClose}>
      <form
        noValidate
        className={styles["body"]}
        onSubmit={(event) => {
          event.preventDefault();
          setIsMismatchShown(password !== again);
          if (password === again) {
            void sending.send(async () => onSubmit({ link, password }));
          }
        }}
      >
        <TextInput
          label="New password"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={setPassword}
          hint="8 to 64 characters"
          error={isPasswordProblem ? REJECTION_MESSAGES.password_invalid : null}
        />
        <TextInput
          label="New password again"
          type="password"
          value={again}
          autoComplete="new-password"
          onChange={setAgain}
          error={isMismatchShown ? NOT_THE_SAME : null}
        />
        <EmailProblem problem={isPasswordProblem ? null : sending.problem} />
        <div className={styles["buttons"]}>
          <Button
            look="primary"
            isSubmit
            isDisabled={password === "" || again === ""}
            loadingLabel={sending.isSending ? "Setting password" : null}
          >
            Set password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
