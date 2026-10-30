import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import type { QuestProgress } from "../../../shared/QuestProgress";
import { QuestPart } from "./QuestPart";
import { questNeedIconFile } from "./questNeedIconFile";
import { questNeedLabel } from "./questNeedLabel";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly name: string;
  readonly progress: QuestProgress;
  readonly needs: ReadonlyArray<QuestNeed>;
};

export function QuestProgressLine({ name, progress, needs }: Props) {
  if (progress.isCompleted) {
    return (
      <li className={styles["progress"]}>
        <span className={styles["player"]}>{name} · completed</span>
      </li>
    );
  }
  return (
    <li className={styles["progress"]}>
      <span className={styles["player"]}>{name}</span>
      <p className={styles["line"]}>
        {needs.map((need, index) => {
          const have = progress.have[index] ?? 0;
          const label = questNeedLabel(need);
          return (
            <QuestPart
              key={label}
              amount={`${String(have)}/${String(need.count)}`}
              label={label}
              iconFile={questNeedIconFile(need)}
              spokenText={`${label} ${String(have)} of ${String(need.count)}`}
            />
          );
        })}
      </p>
    </li>
  );
}
