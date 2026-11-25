import type { ReactNode } from "react";
import styles from "./GamePage.module.css";

type Props = {
  readonly isUsable: boolean;
  readonly children: ReactNode;
};

export function TableContent({ isUsable, children }: Props) {
  return (
    <div className={styles["tableContent"]} inert={!isUsable}>
      {children}
    </div>
  );
}
