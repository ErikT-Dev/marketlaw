import { useId, useState } from "react";
import { CHAT_TEXT_LIMITS } from "../../../shared/CHAT_TEXT_LIMITS";
import { measureChatText } from "../../../shared/measureChatText";
import type { RefusedChatMessage } from "../../store/RefusedChatMessage";
import styles from "./RoomChatPanel.module.css";

type Props = {
  readonly refused: RefusedChatMessage | null;
  readonly onSend: (text: string) => void;
};

export function ChatInput({ refused, onSend }: Props) {
  const counterId = useId();
  const [typed, setTyped] = useState("");
  const [shownRefusal, setShownRefusal] = useState(refused);
  if (refused !== shownRefusal) {
    setShownRefusal(refused);
    if (refused !== null && typed === "") {
      setTyped(refused.text);
    }
  }
  const measured = measureChatText(typed);
  return (
    <form
      className={styles["input"]}
      onSubmit={(event) => {
        event.preventDefault();
        if (measured.characterCount > 0) {
          onSend(measured.text);
          setTyped("");
        }
      }}
    >
      <input
        className={styles["field"]}
        value={typed}
        placeholder="Message the room…"
        aria-label="Message the room"
        aria-describedby={counterId}
        onChange={(event) => {
          setTyped(event.target.value);
        }}
      />
      <span id={counterId} className={styles["counter"]}>
        {measured.characterCount} / {CHAT_TEXT_LIMITS.maxCharacters}
      </span>
    </form>
  );
}
