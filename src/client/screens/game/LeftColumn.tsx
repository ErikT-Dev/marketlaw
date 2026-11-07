import type { PlayerView } from "../../../shared/PlayerView";
import type { ChatBinding } from "../chat/ChatBinding";
import { DrawLogAndChatPanel } from "./DrawLogAndChatPanel";
import styles from "./GamePage.module.css";
import { OpponentsPanel } from "./OpponentsPanel";

type Props = {
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly chat: ChatBinding;
};

export function LeftColumn({ view, playerNames, chat }: Props) {
  return (
    <div className={styles["left"]}>
      <OpponentsPanel view={view} playerNames={playerNames} />
      <DrawLogAndChatPanel drawLog={view.drawLog} playerNames={playerNames} chat={chat} />
    </div>
  );
}
