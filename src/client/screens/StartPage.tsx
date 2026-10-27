import { useState } from "react";
import styles from "./Screens.module.css";

type Props = {
  readonly onStart: (name: string) => void;
};

export function StartPage({ onStart }: Props) {
  const [name, setName] = useState("");
  return (
    <form
      className={styles["page"]}
      onSubmit={(event) => {
        event.preventDefault();
        onStart(name);
      }}
    >
      <h1>MarketLaw</h1>
      <label className={styles["row"]}>
        Your name
        <input
          className={styles["input"]}
          value={name}
          maxLength={20}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </label>
      <div className={styles["row"]}>
        <button className={styles["button"]} type="submit">
          Continue
        </button>
      </div>
    </form>
  );
}
