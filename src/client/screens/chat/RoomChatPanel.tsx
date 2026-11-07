import { useEffect } from "react";
import { useIsScrollable } from "../../components/useIsScrollable";
import type { ChatBinding } from "./ChatBinding";
import { ChatEntryItem } from "./ChatEntryItem";
import { ChatInput } from "./ChatInput";
import { ChatLimitMessage } from "./ChatLimitMessage";
import { MutedPlayersList } from "./MutedPlayersList";
import styles from "./RoomChatPanel.module.css";

type Props = {
  readonly binding: ChatBinding;
};

export function RoomChatPanel({ binding }: Props) {
  const { chat, onSend, onMute, onUnmute, onSeen } = binding;
  const { scrollerRef, contentRef, isScrollable } = useIsScrollable();
  useEffect(() => {
    if (chat.unreadCount > 0) {
      onSeen();
    }
  }, [chat, onSeen]);
  return (
    <div className={styles["chat"]}>
      <MutedPlayersList mutedNames={chat.mutedNames} onUnmute={onUnmute} />
      <div
        ref={scrollerRef}
        className={styles["scroller"]}
        role="group"
        aria-label="Chat"
        tabIndex={isScrollable ? 0 : undefined}
      >
        <div ref={contentRef}>
          {chat.entries.length === 0 ? (
            <p className={styles["empty"]}>No messages yet.</p>
          ) : (
            <ol className={styles["entries"]} aria-label="Chat messages">
              {chat.entries.map((entry, index) => (
                <ChatEntryItem key={String(index)} entry={entry} onMute={onMute} />
              ))}
            </ol>
          )}
        </div>
      </div>
      {chat.refused === null ? null : <ChatLimitMessage refused={chat.refused} />}
      <ChatInput refused={chat.refused} onSend={onSend} />
    </div>
  );
}
