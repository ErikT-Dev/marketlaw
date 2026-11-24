import { memo } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { Panel } from "../../components/Panel";
import { StatChip } from "../../components/StatChip";
import type { StatName } from "../../icons/StatName";
import { typesInListOrder } from "../../sorting/typesInListOrder";
import { ProjectProgressList } from "./ProjectProgressList";
import { TypeCountsList } from "./TypeCountsList";
import styles from "./YourStatsPanel.module.css";
import { Highlighted } from "./Highlighted";
import { tenthsShown } from "../../components/tenthsShown";
import { fundsInTenths } from "../../../shared/fundsInTenths";

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
  "buildPasses",
  "influence",
] as const satisfies ReadonlyArray<StatName>;

function valueOf(seat: OwnSeatView, stat: (typeof SHOWN_STATS)[number]): number | string {
  if (stat === "buildPasses") {
    return seat.buildPasses;
  }
  if (stat === "funds") {
    return tenthsShown(seat.stats.funds);
  }
  return stat === "income" ? tenthsShown(fundsInTenths(seat.stats.income)) : seat.stats[stat];
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
        <div className={styles["countsAndTypes"]}>
          <TypeCountsList
            types={typesInListOrder(seat.typeCounts, view.bonusTypes)}
            typeCounts={seat.typeCounts}
            bonusTypes={view.bonusTypes}
            label="Your type counts, bonus types first"
          />
        </div>
        <ProjectProgressList seat={seat} view={view} playerNames={playerNames} />
      </Panel>
    </Highlighted>
  );
}

export const YourStatsPanel = memo(YourStatsPanelContent);
