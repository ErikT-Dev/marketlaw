import type { ReactNode } from "react";
import styles from "./Lobby.module.css";

type Props = {
  readonly children: ReactNode;
};

export function LobbyTopBar({ children }: Props) {
  return (
    <header className={styles["topBar"]}>
      <h1 className={styles["title"]}>MARKET LAW</h1>
      {children}
    </header>
  );
}
