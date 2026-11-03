import { useState } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { TextInput } from "../../components/TextInput";
import { HumanCheck } from "./HumanCheck";
import styles from "./Lobby.module.css";
import { useSubmitWithHumanCheck } from "./useSubmitWithHumanCheck";

type Props = {
  readonly generatedName: string;
  readonly onSubmit: (name: string, humanCheck: string) => Promise<ReasonCode | null>;
  readonly onCancel: () => void;
};

export function GuestNameDialog({ generatedName, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(generatedName);
  const { containerRef, humanCheckToken, isUnavailable, error, isSending, submit } =
    useSubmitWithHumanCheck();
  return (
    <Modal title="Choose a username" size="large" onClose={onCancel}>
      <form
        className={styles["dialogBody"]}
        onSubmit={(event) => {
          event.preventDefault();
          void submit(async (token) => onSubmit(name.trim(), token));
        }}
      >
        <p>
          You are joining a game without an account. We made up a free username for you; keep it or
          type your own.
        </p>
        <TextInput
          label="Username"
          value={name}
          maxLength={20}
          onChange={setName}
          hint="3 to 20 letters, digits, spaces, - or _"
          error={error}
        />
        <HumanCheck containerRef={containerRef} isUnavailable={isUnavailable} />
        <p className={styles["small"]}>
          This creates a guest account that only works in this browser. You can sign up later to
          keep it and log in anywhere.
        </p>
        <div className={styles["dialogButtons"]}>
          <Button look="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            look="success"
            isSubmit
            isDisabled={humanCheckToken === ""}
            loadingLabel={isSending ? "Continuing" : null}
          >
            Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
