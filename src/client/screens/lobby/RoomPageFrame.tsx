import type { ReactNode } from "react";
import type { ChatBinding } from "../chat/ChatBinding";
import { RoomChatSection } from "../chat/RoomChatSection";
import styles from "./Lobby.module.css";
import { LobbyTopBar } from "./LobbyTopBar";
import { UserBox } from "./UserBox";

type Props = {
  readonly myName: string;
  readonly chat: ChatBinding;
  readonly children: ReactNode;
  readonly overlay: ReactNode;
};

export function RoomPageFrame({ myName, chat, children, overlay }: Props) {
  return (
    <div className={styles["page"]}>
      <LobbyTopBar>
        <UserBox name={myName} isGuest />
      </LobbyTopBar>
      <main className={`${styles["columns"] ?? ""} ${styles["waitingColumns"] ?? ""}`}>
        <section className={styles["panel"]} aria-labelledby="room-heading">
          {children}
        </section>
        <div className={styles["chatColumn"]}>
          <RoomChatSection binding={chat} />
        </div>
      </main>
      {overlay}
    </div>
  );
}
