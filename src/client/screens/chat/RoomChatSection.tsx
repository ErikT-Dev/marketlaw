import { useId } from "react";
import type { ChatBinding } from "./ChatBinding";
import { RoomChatPanel } from "./RoomChatPanel";
import styles from "./RoomChatSection.module.css";

type Props = {
  readonly binding: ChatBinding;
};

export function RoomChatSection({ binding }: Props) {
  const titleId = useId();
  return (
    <section className={styles["section"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["title"]}>
        Room chat
      </h2>
      <RoomChatPanel binding={binding} />
    </section>
  );
}
