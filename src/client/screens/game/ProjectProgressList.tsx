import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { PROJECT_NAMES } from "../../../shared/PROJECT_NAMES";
import { PROJECT_NEED } from "../../../shared/PROJECT_NEED";
import type { ProjectName } from "../../../shared/ProjectName";
import { HelpButton } from "../../components/HelpButton";
import { StatChip } from "../../components/StatChip";
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
  ownSeat: OwnSeatView,
  view: PlayerView,
  playerNames: ReadonlyArray<string>,
) {
  const names = view.seats
    .filter((seat) => seat.kind === "other" && seat.projects.includes(project))
    .map((seat) => playerNameOf(playerNames, seat.seat));
  if (names.length > 0) {
    return <> · Completed by {names.join(", ")}</>;
  }
  const isFirstStillPossible =
    !ownSeat.projects.includes(project) && !view.firstCompletions.includes(project);
  return isFirstStillPossible ? (
    <>
      {" "}
      · First to complete gets +2 <StatChip stat="funds" />
    </>
  ) : null;
}

export function ProjectProgressList({ seat, view, playerNames }: Props) {
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
            {othersNote(project, seat, view, playerNames)}
          </li>
        ))}
      </ul>
    </div>
  );
}
