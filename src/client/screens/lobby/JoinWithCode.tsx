import { useId, useState } from "react";
import { Button } from "../../components/Button";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./Lobby.module.css";

type Props = {
  readonly error: IconText | null;
  readonly onJoin: (code: string) => void;
  readonly onCreate: () => void;
  readonly isBusy: boolean;
};

export function JoinWithCode({ error, onJoin, onCreate, isBusy }: Props) {
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
            <TextWithIcons text={error} />
          </p>
        )}
      </div>
      <Button look="secondary" isSubmit isDisabled={isBusy || code.trim() === ""}>
        Join with code
      </Button>
      <Button look="primary" isDisabled={isBusy} onClick={onCreate}>
        Create room
      </Button>
    </form>
  );
}
