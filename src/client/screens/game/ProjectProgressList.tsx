import { useContext } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import { PROJECT_NAMES } from "../../../shared/PROJECT_NAMES";
import { PROJECT_NEED } from "../../../shared/PROJECT_NEED";
import type { ProjectName } from "../../../shared/ProjectName";
import { HelpButton } from "../../components/HelpButton";
import { PlayerIcon } from "../../components/PlayerIcon";
import { StatChip } from "../../components/StatChip";
import { playerIconOf } from "./playerIconOf";
import { PlayerIcons } from "./PlayerIcons";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import { PROJECTS_HELP } from "./PROJECTS_HELP";
import styles from "./YourStatsPanel.module.css";

type Props = {
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
};

function othersNote(
  project: ProjectName,
  { view, playerNames }: Props,
  playerIcons: ReadonlyArray<PlayerIconChoice>,
) {
  const completers = view.seats.filter(
    (seat) => seat.kind === "other" && seat.projects.includes(project),
  );
  return completers.length === 0 ? null : (
    <>
      {" "}
      · Completed by{" "}
      {completers.map(({ seat }) => {
        const name = playerNameOf(playerNames, seat);
        return <PlayerIcon key={seat} name={name} icon={playerIconOf(playerIcons, seat)} />;
      })}
    </>
  );
}

export function ProjectProgressList(props: Props) {
  const { seat } = props;
  const playerIcons = useContext(PlayerIcons);
  return (
    <div className={styles["projectsArea"]}>
      <div className={styles["projectsTitle"]}>
        <h3>Projects</h3>
        <HelpButton name="How projects work" text={PROJECTS_HELP} />
      </div>
      <ul className={styles["projects"]} aria-label="Your projects">
        {PROJECT_NAMES.map((project) => (
          <li key={project}>
            {PROJECT_TITLES[project]}{" "}
            {seat.projects.includes(project) ? (
              "· you completed ✓"
            ) : (
              <StatChip
                stat={project}
                value={`${String(Math.min(seat.stats[project], PROJECT_NEED))}/${String(PROJECT_NEED)}`}
              />
            )}
            {othersNote(project, props, playerIcons)}
          </li>
        ))}
      </ul>
    </div>
  );
}
