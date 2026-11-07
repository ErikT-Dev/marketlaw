import type { RefusedChatMessage } from "../../store/RefusedChatMessage";
import { useServerNow } from "../game/useServerNow";
import { chatLimitText } from "./chatLimitText";
import styles from "./RoomChatPanel.module.css";

type Props = {
  readonly refused: RefusedChatMessage;
};

export function ChatLimitMessage({ refused }: Props) {
  const serverNow = useServerNow();
  const text = chatLimitText(refused, serverNow);
  return text === null ? null : (
    <p className={styles["limit"]} role="status">
      {text}
    </p>
  );
}
