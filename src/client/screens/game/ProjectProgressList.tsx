import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { PROJECT_NAMES } from "../../../shared/PROJECT_NAMES";
import { PROJECT_NEED } from "../../../shared/PROJECT_NEED";
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

function othersText(
  project: ProjectName,
  ownSeat: OwnSeatView,
  view: PlayerView,
  playerNames: ReadonlyArray<string>,
) {
  const names = view.seats
    .filter((seat) => seat.kind === "other" && seat.projects.includes(project))
    .map((seat) => playerNameOf(playerNames, seat.seat));
  if (names.length > 0) {
    return `done: ${names.join(", ")}`;
  }
  const isFirstStillPossible =
    !ownSeat.projects.includes(project) && !view.firstCompletions.includes(project);
  return isFirstStillPossible ? "nobody yet, the first gets +2 funds" : "";
}

export function ProjectProgressList({ seat, view, playerNames }: Props) {
  return (
    <ul className={styles["projects"]} aria-label="Your projects">
      {PROJECT_NAMES.map((project) => {
        const isDone = seat.projects.includes(project);
        const others = othersText(project, seat, view, playerNames);
        return (
          <li key={project}>
            {PROJECT_TITLES[project]}{" "}
            {isDone ? (
              "· you completed ✓"
            ) : (
              <StatChip
                stat={project}
                value={`${String(Math.min(seat.stats[project], PROJECT_NEED))}/${String(PROJECT_NEED)}`}
              />
            )}
            {others === "" ? "" : ` · ${others}`}
          </li>
        );
      })}
    </ul>
  );
}
