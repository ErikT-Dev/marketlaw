import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { PROJECT_NAMES } from "../../../shared/PROJECT_NAMES";
import { PROJECT_NEED } from "../../../shared/PROJECT_NEED";
import type { ProjectName } from "../../../shared/ProjectName";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./GameDialogs.module.css";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";

type Props = {
  readonly seat: OwnSeatView;
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly onComplete: (project: ProjectName) => void;
  readonly onClose: () => void;
};

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
  const missing = PROJECT_NEED - seat.stats[project];
  return missing > 0 ? `Need ${String(missing)} more` : "Complete";
}

function whyNotCompletable(seat: OwnSeatView, project: ProjectName): string | null {
  const rejection = seat.projectRejections[project];
  const isOnlyMissingTheStat = seat.stats[project] < PROJECT_NEED;
  return rejection === null || seat.projects.includes(project) || isOnlyMissingTheStat
    ? null
    : REJECTION_MESSAGES[rejection];
}

export function ProjectsDialog({ seat, view, playerNames, onComplete, onClose }: Props) {
  const isThirdNext = seat.projects.length === PROJECT_NAMES.length - 1;
  return (
    <Modal title="Projects" size="large" onClose={onClose}>
      <p className={styles["text"]}>
        Completing a project uses up 8 of its stat and gives +1 income, +2 funds, +3 influence and 1
        card. Workforce, quality and satisfaction must all be 0 or more.
      </p>
      <ul className={styles["rows"]}>
        {PROJECT_NAMES.map((project) => (
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
              {whyNotCompletable(seat, project) === null ? null : (
                <span className={styles["note"]}>{whyNotCompletable(seat, project)}</span>
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
