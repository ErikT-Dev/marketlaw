import { UsernameLink } from "../../components/UsernameLink";
import type { ChatEntry } from "../../../shared/protocol/ChatEntry";
import styles from "./RoomChatPanel.module.css";
import { chatLineText } from "./chatLineText";
import { chatTimeText } from "./chatTimeText";

type Props = {
  readonly entry: ChatEntry;
  readonly onMute: (playerName: string) => void;
};

export function ChatEntryItem({ entry, onMute }: Props) {
  if (entry.kind !== "message") {
    return <li className={styles["line"]}>{chatLineText(entry)}</li>;
  }
  return (
    <li className={entry.isOwn ? styles["ownMessage"] : styles["message"]}>
      <div className={styles["header"]}>
        <span className={entry.isOwn ? styles["ownSender"] : styles["sender"]}>
          {entry.isOwn ? "You" : <UsernameLink playerId={entry.fromId} username={entry.from} />}
        </span>
        <time className={styles["time"]} dateTime={new Date(entry.at).toISOString()}>
          {chatTimeText(entry.at)}
        </time>
        {entry.isOwn ? null : (
          <button
            type="button"
            className={styles["mute"]}
            aria-label={`Mute ${entry.from}`}
            onClick={() => {
              onMute(entry.from);
            }}
          >
            Mute
          </button>
        )}
      </div>
      <p className={styles["text"]}>{entry.text}</p>
    </li>
  );
}
