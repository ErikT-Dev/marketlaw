import { useState } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { TextInput } from "../../components/TextInput";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import styles from "./Account.module.css";
import { DeleteAccountWarning } from "./DeleteAccountWarning";

type Props = {
  readonly isInGame: boolean;
  readonly onDelete: (password: string) => Promise<ReasonCode | null>;
  readonly onCancel: () => void;
};

export function DeleteAccountDialog({ isInGame, onDelete, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  async function deleteAccount() {
    setIsDeleting(true);
    const answer = await onDelete(password);
    setIsDeleting(false);
    setProblem(answer);
  }
  return (
    <Modal
      title={isInGame ? "Delete your account during a game?" : "Delete your account?"}
      size="large"
      onClose={onCancel}
    >
      <form
        className={styles["deleteForm"]}
        onSubmit={(event) => {
          event.preventDefault();
          void deleteAccount();
        }}
      >
        <DeleteAccountWarning isInGame={isInGame} />
        <TextInput
          label="Password"
          type="password"
          value={password}
          maxLength={1024}
          autoComplete="current-password"
          onChange={(value) => {
            setPassword(value);
            setProblem(null);
          }}
          error={problem === null ? null : REJECTION_MESSAGES[problem]}
        />
        <div className={styles["warningButtons"]}>
          <Button look="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            look="danger"
            isSubmit
            isDisabled={password === ""}
            loadingLabel={isDeleting ? "Deleting" : null}
          >
            {isInGame ? "Leave the game and delete" : "Delete account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
