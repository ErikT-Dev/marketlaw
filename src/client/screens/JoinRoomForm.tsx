import { useState } from "react";
import styles from "./Screens.module.css";

type Props = {
  readonly onJoin: (code: string) => void;
};

export function JoinRoomForm({ onJoin }: Props) {
  const [code, setCode] = useState("");
  return (
    <section className={styles["panel"]} aria-label="Join a room">
      <div className={styles["row"]}>
        <label className={styles["row"]}>
          Room code
          <input
            className={styles["input"]}
            value={code}
            maxLength={6}
            onChange={(event) => {
              setCode(event.target.value);
            }}
          />
        </label>
        <button
          className={styles["button"]}
          type="button"
          onClick={() => {
            onJoin(code);
          }}
        >
          Join room
        </button>
      </div>
    </section>
  );
}
