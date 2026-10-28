import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ProjectName } from "../../../shared/ProjectName";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./GameDialogs.module.css";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";

type Props = {
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly onComplete: (project: ProjectName) => void;
  readonly onClose: () => void;
};

const PROJECTS: ReadonlyArray<ProjectName> = ["quality", "satisfaction", "workforce"];
const NEED = 8;

function firstCompletionText(project: ProjectName, view: PlayerView, names: ReadonlyArray<string>) {
  const others = view.seats
    .filter((seat) => seat.kind === "other" && seat.projects.includes(project))
    .map((seat) => playerNameOf(names, seat.seat));
  if (!view.firstCompletions.includes(project)) {
    return "Nobody has completed it yet: whoever completes it first gets +2 funds at the end of that turn.";
  }
  return others.length === 0
    ? "No first-completion bonus: it was completed in an earlier turn."
    : `No first-completion bonus: ${others.join(", ")} completed it in an earlier turn.`;
}

function buttonLabel(seat: OwnSeatView, project: ProjectName): string {
  if (seat.projects.includes(project)) {
    return "Completed ✓";
  }
  const missing = NEED - seat.stats[project];
  return missing > 0 ? `Need ${String(missing)} more` : "Complete";
}

export function ProjectsDialog({ seat, view, playerNames, onComplete, onClose }: Props) {
  const isThirdNext = seat.projects.length === PROJECTS.length - 1;
  return (
    <Modal title="Projects" size="large" onClose={onClose}>
      <p className={styles["text"]}>
        Completing a project uses up 8 of its stat and gives +1 income, +2 funds, +3 influence and 1
        card. Workforce, quality and satisfaction must all be 0 or more.
      </p>
      <ul className={styles["rows"]}>
        {PROJECTS.map((project) => (
          <li key={project} className={styles["project"]} aria-label={PROJECT_TITLES[project]}>
            <div>
              <strong>{PROJECT_TITLES[project]}</strong>
              <span>
                Needs 8 {project} · you have {seat.stats[project]}
              </span>
              {seat.projects.includes(project) ? null : (
                <span className={styles["note"]}>
                  {firstCompletionText(project, view, playerNames)}
                </span>
              )}
            </div>
            <Button
              look="success"
              isDisabled={seat.projectRejections[project] !== null}
              onClick={() => {
                onComplete(project);
              }}
            >
              {buttonLabel(seat, project)}
            </Button>
          </li>
        ))}
      </ul>
      {isThirdNext ? (
        <p className={styles["warning"]}>
          This would be your 3rd project: it also gives +1 more income and 1 more card.
        </p>
      ) : null}
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
