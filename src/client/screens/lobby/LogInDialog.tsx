import { useState } from "react";
import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Modal } from "../../components/Modal";
import { TextInput } from "../../components/TextInput";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { DialogButtons } from "./DialogButtons";
import styles from "./Lobby.module.css";
import { LoginHumanCheck } from "./LoginHumanCheck";
import { useLoginAttempts } from "./useLoginAttempts";

type Props = {
  readonly onSubmit: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: () => void;
  readonly onCancel: () => void;
};

export function LogInDialog({ onSubmit, onSignUp, onCancel }: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const attempts = useLoginAttempts(onSubmit);
  const { problem, humanCheckAttempt } = attempts;
  const isIncomplete = login.trim() === "" || password === "" || attempts.isWaitingForHumanCheck;
  return (
    <Modal title="Log in" size="large" onClose={onCancel}>
      <form
        className={styles["dialogBody"]}
        onSubmit={(event) => {
          event.preventDefault();
          void attempts.submit(login, password);
        }}
      >
        <TextInput
          label="Username or email"
          value={login}
          maxLength={254}
          autoComplete="username"
          onChange={setLogin}
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={setPassword}
          error={problem === null ? null : REJECTION_MESSAGES[problem]}
        />
        <div className={styles["accountLinks"]}>
          <button type="button" className={styles["linkButton"]} onClick={onSignUp}>
            No account yet? Sign up
          </button>
        </div>
        {humanCheckAttempt === null ? null : (
          <LoginHumanCheck attempt={humanCheckAttempt} onTokenChange={attempts.setHumanCheck} />
        )}
        <DialogButtons
          submitLabel="Log in"
          sendingLabel={attempts.isSending ? "Logging in" : null}
          isDisabled={isIncomplete}
          onCancel={onCancel}
        />
      </form>
    </Modal>
  );
}
