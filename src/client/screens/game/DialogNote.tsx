import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import styles from "./GameDialogs.module.css";

type Props = {
  readonly text: IconText | null;
};

export function DialogNote({ text }: Props) {
  return text === null ? null : (
    <span className={styles["note"]}>
      <TextWithIcons text={text} />
    </span>
  );
}
