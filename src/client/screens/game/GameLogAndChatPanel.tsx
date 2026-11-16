import { useState } from "react";
import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import { Tab } from "../../components/Tab";
import { useIsScrollable } from "../../components/useIsScrollable";
import type { ChatBinding } from "../chat/ChatBinding";
import { RoomChatPanel } from "../chat/RoomChatPanel";
import styles from "./GameLogAndChatPanel.module.css";
import { GameLogList } from "./GameLogList";

type Props = {
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly mainPhaseLog: ReadonlyArray<MainPhaseLogEntry>;
  readonly playerNames: ReadonlyArray<string>;
  readonly chat: ChatBinding;
};

export function GameLogAndChatPanel({ drawLog, mainPhaseLog, playerNames, chat }: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  return (
    <section className={styles["panel"]} aria-label="Game log and chat">
      <div className={styles["tabs"]} role="tablist" aria-label="Game log and chat">
        <Tab
          label="Log"
          isSelected={!isChatOpen}
          onSelect={() => {
            setIsChatOpen(false);
          }}
        />
        <Tab
          label="Chat"
          isSelected={isChatOpen}
          count={isChatOpen ? 0 : chat.chat.unreadCount}
          onSelect={() => {
            setIsChatOpen(true);
          }}
        />
      </div>
      {isChatOpen ? (
        <div className={styles["chatBody"]} role="tabpanel" aria-label="Chat">
          <RoomChatPanel binding={chat} />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className={styles["logBody"]}
          role="tabpanel"
          aria-label="Game log"
          tabIndex={isScrollable ? 0 : undefined}
        >
          <div ref={contentRef}>
            <GameLogList drawLog={drawLog} mainPhaseLog={mainPhaseLog} playerNames={playerNames} />
          </div>
        </div>
      )}
    </section>
  );
}
