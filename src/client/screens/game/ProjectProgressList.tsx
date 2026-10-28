import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ProjectName } from "../../../shared/ProjectName";
import { StatChip } from "../../components/StatChip";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import styles from "./YourStatsPanel.module.css";

type Props = {
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
};

const PROJECTS: ReadonlyArray<ProjectName> = ["quality", "satisfaction", "workforce"];
const NEED = 8;

function othersText(project: ProjectName, view: PlayerView, playerNames: ReadonlyArray<string>) {
  const names = view.seats
    .filter((seat) => seat.kind === "other" && seat.projects.includes(project))
    .map((seat) => playerNameOf(playerNames, seat.seat));
  if (names.length > 0) {
    return `done: ${names.join(", ")}`;
  }
  return view.firstCompletions.includes(project) ? "" : "nobody yet, the first gets +2 funds";
}

export function ProjectProgressList({ seat, view, playerNames }: Props) {
  return (
    <ul className={styles["projects"]} aria-label="Your projects">
      {PROJECTS.map((project) => {
        const isDone = seat.projects.includes(project);
        const others = othersText(project, view, playerNames);
        return (
          <li key={project}>
            {PROJECT_TITLES[project]}{" "}
            <StatChip stat={project} value={`${String(Math.min(seat.stats[project], NEED))}/8`} />
            {isDone ? " · you completed ✓" : ""}
            {others === "" ? "" : ` · ${others}`}
          </li>
        );
      })}
    </ul>
  );
}
