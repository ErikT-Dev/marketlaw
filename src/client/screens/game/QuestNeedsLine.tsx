import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import { QuestNeedParts } from "./QuestNeedParts";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly needs: ReadonlyArray<QuestNeed>;
};

export function QuestNeedsLine({ needs }: Props) {
  return (
    <p className={styles["line"]}>
      Needs:
      <QuestNeedParts needs={needs} />
    </p>
  );
}
