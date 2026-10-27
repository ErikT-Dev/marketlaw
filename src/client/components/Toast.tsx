import styles from "./Toast.module.css";

type Props = {
  readonly kind: "success" | "error" | "info" | "warning";
  readonly title: string;
  readonly text: string;
  readonly onClose: () => void;
};

export function Toast({ kind, title, text, onClose }: Props) {
  return (
    <div
      className={`${styles["toast"] ?? ""} ${styles[kind] ?? ""}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <div className={styles["text"]}>
        <span className={styles["title"]}>{title}</span>
        <span className={styles["body"]}>{text}</span>
      </div>
      <button
        className={styles["close"]}
        type="button"
        aria-label={`Close: ${title}`}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
