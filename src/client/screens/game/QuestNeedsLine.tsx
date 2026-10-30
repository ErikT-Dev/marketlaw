import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import { QuestPart } from "./QuestPart";
import { questNeedIconFile } from "./questNeedIconFile";
import { questNeedLabel } from "./questNeedLabel";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly needs: ReadonlyArray<QuestNeed>;
};

export function QuestNeedsLine({ needs }: Props) {
  return (
    <p className={styles["line"]}>
      Needs:
      {needs.map((need) => {
        const label = questNeedLabel(need);
        return (
          <QuestPart
            key={label}
            amount={String(need.count)}
            label={label}
            iconFile={questNeedIconFile(need)}
            spokenText={`${String(need.count)} ${label}`}
          />
        );
      })}
    </p>
  );
}
