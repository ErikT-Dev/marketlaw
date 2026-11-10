import styles from "./Account.module.css";

type Props = {
  readonly tone: "removed" | "pending";
  readonly title: string | null;
  readonly text: string;
};

export function EmailNote({ tone, title, text }: Props) {
  return (
    <div className={styles[tone === "removed" ? "emailRemoved" : "emailPending"]}>
      {title === null ? null : <p className={styles["emailNoteTitle"]}>{title}</p>}
      <p className={styles["emailNoteText"]}>{text}</p>
    </div>
  );
}
