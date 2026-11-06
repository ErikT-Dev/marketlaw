import { useState } from "react";
import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import { Tab } from "../../components/Tab";
import { useIsScrollable } from "../../components/useIsScrollable";
import type { ChatBinding } from "../chat/ChatBinding";
import { RoomChatPanel } from "../chat/RoomChatPanel";
import styles from "./DrawLogAndChatPanel.module.css";
import { DrawLogList } from "./DrawLogList";

type Props = {
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly playerNames: ReadonlyArray<string>;
  readonly chat: ChatBinding;
};

export function DrawLogAndChatPanel({ drawLog, playerNames, chat }: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  return (
    <section className={styles["panel"]} aria-label="Draw log and chat">
      <div className={styles["tabs"]} role="tablist" aria-label="Draw log and chat">
        <Tab
          label="Draw log"
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
          aria-label="Draw log"
          tabIndex={isScrollable ? 0 : undefined}
        >
          <div ref={contentRef}>
            <DrawLogList drawLog={drawLog} playerNames={playerNames} />
          </div>
        </div>
      )}
    </section>
  );
}
