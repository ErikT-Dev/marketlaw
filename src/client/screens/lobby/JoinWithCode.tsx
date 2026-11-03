import { useId, useState } from "react";
import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";

type Props = {
  readonly error: string | null;
  readonly onJoin: (code: string) => void;
  readonly onCreate: () => void;
};

export function JoinWithCode({ error, onJoin, onCreate }: Props) {
  const [code, setCode] = useState("");
  const errorId = useId();
  return (
    <form
      className={styles["joinRow"]}
      onSubmit={(event) => {
        event.preventDefault();
        onJoin(code);
      }}
    >
      <div className={styles["codeField"]}>
        <input
          className={styles["codeInput"]}
          aria-label="Room code"
          placeholder="Room code"
          value={code}
          maxLength={6}
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : errorId}
          onChange={(event) => {
            setCode(event.target.value);
          }}
        />
        {error === null ? null : (
          <p id={errorId} role="alert" className={styles["joinError"]}>
            {error}
          </p>
        )}
      </div>
      <Button look="secondary" isSubmit isDisabled={code.trim() === ""}>
        Join with code
      </Button>
      <Button look="primary" onClick={onCreate}>
        Create room
      </Button>
    </form>
  );
}
