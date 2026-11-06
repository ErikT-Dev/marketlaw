import { useEffect, useId, type ReactNode } from "react";
import type { IconText } from "./IconText";
import styles from "./Modal.module.css";
import { ModalBackdrop } from "./ModalBackdrop";
import { TextWithIcons } from "./TextWithIcons";

type Props = {
  readonly title: IconText;
  readonly size: "large" | "extraLarge";
  readonly children: ReactNode;
  readonly onClose?: () => void;
};

export function Modal({ title, size, children, onClose }: Props) {
  const titleId = useId();
  useEffect(() => {
    if (onClose === undefined) {
      return undefined;
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);
  return (
    <ModalBackdrop>
      <section
        className={`${styles["modal"] ?? ""} ${styles[size] ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles["title"]}>
          <TextWithIcons text={title} />
        </h2>
        {children}
      </section>
    </ModalBackdrop>
  );
}
