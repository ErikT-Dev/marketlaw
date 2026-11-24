import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import type { QuestProgress } from "../../../shared/QuestProgress";
import { PlayerIcon } from "../../components/PlayerIcon";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { negativeStatsShownIn } from "./negativeStatsShownIn";
import { QuestPart } from "./QuestPart";
import { QuestPlayerName } from "./QuestPlayerName";
import { questNeedIconFile } from "./questNeedIconFile";
import { questNeedLabel } from "./questNeedLabel";
import { questNeedSector } from "./questNeedSector";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly name: string;
  readonly icon: PlayerIconChoice | null;
  readonly progress: QuestProgress;
  readonly needs: ReadonlyArray<QuestNeed>;
  readonly isViewer: boolean;
};

export function QuestProgressLine({ name, icon, progress, needs, isViewer }: Props) {
  if (progress.isCompleted) {
    return (
      <li className={styles["progress"]}>
        <span className={styles["player"]}>
          <PlayerIcon name={name} icon={icon} /> · completed
        </span>
      </li>
    );
  }
  return (
    <li className={styles["progress"]}>
      <QuestPlayerName
        name={name}
        icon={icon}
        canCompleteNow={!isViewer && progress.canCompleteNow}
      />
      <p className={styles["line"]}>
        {needs.map((need, index) => {
          const have = progress.have[index] ?? 0;
          const label = questNeedLabel(need);
          return (
            <QuestPart
              key={label}
              amount={`${String(have)}/${String(need.count)}`}
              label={label}
              sector={questNeedSector(need)}
              iconFile={questNeedIconFile(need)}
              spokenText={`${label} ${String(have)} of ${String(need.count)}`}
            />
          );
        })}
        {negativeStatsShownIn(progress.negativeStats, needs, isViewer).map(({ stat, value }) => {
          const label = STAT_ICONS[stat].label;
          return (
            <QuestPart
              key={stat}
              amount={`${String(value)}/0`}
              label={label}
              sector={null}
              iconFile={STAT_ICONS[stat].file}
              spokenText={`${label} ${String(value)} of 0`}
            />
          );
        })}
      </p>
    </li>
  );
}
