import type { ReactNode } from "react";
import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import type { ChatBinding } from "../chat/ChatBinding";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { useRegisteredAccountDetails } from "../account/useRegisteredAccountDetails";
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

const NO_CHECK = "";

export function RoomPageFrame({ account, chat, playersOnline, children, overlay }: Props) {
  const details = useRegisteredAccountDetails(account, NO_CHECK);
  return (
    <div className={styles["page"]}>
      <LobbyTopBar menuPlace="waiting_room">
        <div className={styles["accountButtons"]}>
          <RankingButton />
          <UserAccount account={account} rating={details?.rating?.rating ?? null} />
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
