import type { ReactNode } from "react";
import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import type { ChatBinding } from "../chat/ChatBinding";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { RoomChatSection } from "../chat/RoomChatSection";
import styles from "./Lobby.module.css";
import { LobbyTopBar } from "./LobbyTopBar";
import { PlayersOnlinePanel } from "./PlayersOnlinePanel";
import { RankingButton } from "./RankingButton";

type Props = {
  readonly account: AccountBinding;
  readonly chat: ChatBinding;
  readonly playersOnline: ReadonlyArray<PlayerOnlineView>;
  readonly children: ReactNode;
  readonly overlay: ReactNode;
};

export function RoomPageFrame({ account, chat, playersOnline, children, overlay }: Props) {
  return (
    <div className={styles["page"]}>
      <LobbyTopBar>
        <div className={styles["accountButtons"]}>
          <RankingButton />
          <UserAccount account={account} />
        </div>
      </LobbyTopBar>
      <main
        className={`${styles["columns"] ?? ""} ${styles["waitingColumns"] ?? ""} ${styles["withPlayersOnline"] ?? ""}`}
      >
        <PlayersOnlinePanel players={playersOnline} />
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
