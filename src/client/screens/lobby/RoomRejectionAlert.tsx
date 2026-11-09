import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./Lobby.module.css";

type Props = {
  readonly rejection: IconText | null;
};

export function RoomRejectionAlert({ rejection }: Props) {
  return rejection === null ? null : (
    <p role="alert" className={styles["error"]}>
      <TextWithIcons text={rejection} />
    </p>
  );
}
