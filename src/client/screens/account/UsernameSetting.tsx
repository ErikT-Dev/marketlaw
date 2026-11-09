import { useState } from "react";
import type { AccountResponse } from "../../../shared/api/AccountResponse";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import styles from "./Account.module.css";
import { usernameHintOf } from "./usernameHintOf";
import { useUsernameWait } from "./useUsernameWait";

type Props = {
  readonly name: string;
  readonly onChangeUsername: (username: string) => Promise<ReasonCode | null>;
  readonly onLoadAccount: () => Promise<AccountResponse | null>;
};

export function UsernameSetting({ name, onChangeUsername, onLoadAccount }: Props) {
  const { wait, reload } = useUsernameWait(onLoadAccount);
  const [username, setUsername] = useState(name);
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isWaiting = wait !== null;
  async function changeUsername() {
    setIsSending(true);
    const answer = await onChangeUsername(username.trim());
    setProblem(answer);
    setIsSending(false);
    await reload();
  }
  return (
    <form
      className={styles["usernameForm"]}
      onSubmit={(event) => {
        event.preventDefault();
        void changeUsername();
      }}
    >
      <TextInput
        label="Username"
        value={username}
        onChange={setUsername}
        maxLength={20}
        hint={usernameHintOf(wait)}
        error={problem === null ? null : REJECTION_MESSAGES[problem]}
        autoComplete="username"
        isDisabled={isWaiting}
      />
      <Button
        look="secondary"
        isSubmit
        isDisabled={isWaiting || username.trim() === name}
        loadingLabel={isSending ? "Changing" : null}
      >
        Change
      </Button>
    </form>
  );
}
