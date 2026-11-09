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
  readonly type?: "text" | "email" | "password";
  readonly autoComplete?: string;
  readonly isDisabled?: boolean;
};

export function TextInput(props: Props) {
  const {
    label,
    value,
    onChange,
    maxLength,
    hint,
    error = null,
    type = "text",
    autoComplete,
    isDisabled = false,
  } = props;
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
        type={type}
        autoComplete={autoComplete}
        value={value}
        maxLength={maxLength}
        disabled={isDisabled}
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
