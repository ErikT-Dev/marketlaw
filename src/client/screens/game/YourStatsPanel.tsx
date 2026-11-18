import { memo } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { Panel } from "../../components/Panel";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import { ProjectProgressList } from "./ProjectProgressList";
import { TypeCountsList } from "./TypeCountsList";
import styles from "./YourStatsPanel.module.css";
import { Highlighted } from "./Highlighted";

type Props = {
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
};

const SHOWN_STATS = [
  "funds",
  "income",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "bonus",
  "buildPasses",
  "influence",
] as const satisfies ReadonlyArray<StatName>;

function valueOf(seat: OwnSeatView, stat: (typeof SHOWN_STATS)[number]): number {
  return stat === "buildPasses" ? seat.buildPasses : seat.stats[stat];
}

function YourStatsPanelContent({ seat, view, playerNames }: Props) {
  return (
    <Highlighted part={{ kind: "panel", panel: "stats" }} isBlock>
      <Panel title="Your stats">
        <ul className={styles["statGrid"]} aria-label="Stat values">
          {SHOWN_STATS.map((stat) => (
            <li key={stat}>
              <StatChip stat={stat} value={valueOf(seat, stat)} />
            </li>
          ))}
        </ul>
        <TypeCountsList
          typeCounts={seat.typeCounts}
          bonusTypes={view.bonusTypes}
          label="Your type counts, bonus types first"
        />
        <ProjectProgressList seat={seat} view={view} playerNames={playerNames} />
      </Panel>
    </Highlighted>
  );
}

export const YourStatsPanel = memo(YourStatsPanelContent);
