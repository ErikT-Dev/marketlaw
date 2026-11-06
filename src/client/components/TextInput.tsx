import { useId } from "react";
import type { IconText } from "./IconText";
import { TextWithIcons } from "./TextWithIcons";
import styles from "./TextInput.module.css";

type Props = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly maxLength?: number;
  readonly hint?: string;
  readonly error?: IconText | null;
};

export function TextInput({ label, value, onChange, maxLength, hint, error = null }: Props) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={styles["field"]}>
      <label className={styles["label"]} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles["input"]}
        value={value}
        maxLength={maxLength}
        aria-invalid={error !== null}
        aria-describedby={message === undefined ? undefined : messageId}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {message === undefined ? null : (
        <span id={messageId} className={error === null ? styles["hint"] : styles["error"]}>
          <TextWithIcons text={message} />
        </span>
      )}
    </div>
  );
}
