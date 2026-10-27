import { useId, type ReactNode } from "react";
import styles from "./Modal.module.css";
import { ModalBackdrop } from "./ModalBackdrop";

type Props = {
  readonly title: string;
  readonly size: "large" | "extraLarge";
  readonly children: ReactNode;
};

export function Modal({ title, size, children }: Props) {
  const titleId = useId();
  return (
    <ModalBackdrop>
      <section
        className={`${styles["modal"] ?? ""} ${styles[size] ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles["title"]}>
          {title}
        </h2>
        {children}
      </section>
    </ModalBackdrop>
  );
}
