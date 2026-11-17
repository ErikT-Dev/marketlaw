import type { ReactNode } from "react";
import { GameMenu } from "../menu/GameMenu";
import type { GameMenuPlace } from "../menu/GameMenuPlace";
import styles from "./Lobby.module.css";

type Props = {
  readonly menuPlace: Exclude<GameMenuPlace, "game">;
  readonly children: ReactNode;
};

export function LobbyTopBar({ menuPlace, children }: Props) {
  return (
    <header className={styles["topBar"]}>
      <div className={styles["brand"]}>
        <h1 className={styles["title"]}>MARKET LAW</h1>
        <GameMenu place={menuPlace} buttonLabel="Game menu" />
      </div>
      {children}
    </header>
  );
}
