import type { IconText } from "./IconText";
import { TextWithIcons } from "./TextWithIcons";
import styles from "./Toast.module.css";

type Props = {
  readonly kind: "success" | "error" | "info" | "warning";
  readonly title: string | null;
  readonly text: IconText;
  readonly onClose: (() => void) | null;
};

export function Toast({ kind, title, text, onClose }: Props) {
  return (
    <div
      className={`${styles["toast"] ?? ""} ${styles[kind] ?? ""}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <div className={styles["text"]}>
        {title === null ? null : <span className={styles["title"]}>{title}</span>}
        <span className={styles[title === null ? "titleless" : "body"]}>
          <TextWithIcons text={text} />
        </span>
      </div>
      {onClose === null ? null : (
        <button
          className={styles["close"]}
          type="button"
          aria-label={`Close: ${title ?? "notice"}`}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
