import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type Props = {
  readonly children: ReactNode;
};

export function ModalBackdrop({ children }: Props) {
  return <div className={styles["backdrop"]}>{children}</div>;
}
