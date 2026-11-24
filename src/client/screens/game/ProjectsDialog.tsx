import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { PROJECT_NAMES } from "../../../shared/PROJECT_NAMES";
import { PROJECT_INCOME_NEED } from "../../../shared/PROJECT_INCOME_NEED";
import { PROJECT_NEED } from "../../../shared/PROJECT_NEED";
import type { ProjectName } from "../../../shared/ProjectName";
import { Button } from "../../components/Button";
import type { IconText } from "../../components/IconText";
import { Modal } from "../../components/Modal";
import { StatChip } from "../../components/StatChip";
import { TextWithIcons } from "../../components/TextWithIcons";
import { DialogNote } from "./DialogNote";
import styles from "./GameDialogs.module.css";
import { PROJECT_TITLES } from "./PROJECT_TITLES";
import { REJECTION_MESSAGES } from "./REJECTION_MESSAGES";
import { projectPictureUrl } from "../../icons/projectPictureUrl";

type Props = {
  readonly seat: OwnSeatView;
  readonly onComplete: (project: ProjectName) => void;
  readonly onClose: () => void;
};

const PROJECTS_INTRO: IconText = [
  "Completing a project uses up 8 of its stat and gives ",
  { stat: "income", value: "+10" },
  ", ",
  { stat: "funds", value: "+20" },
  ", ",
  { stat: "influence", value: "+3" },
  " and 1 card, every time. ",
  { stat: "workforce" },
  ", ",
  { stat: "quality" },
  " and ",
  { stat: "satisfaction" },
  " must all be 0 or more.",
];

function buttonLabel(seat: OwnSeatView, project: ProjectName): string {
  if (seat.projects.includes(project)) {
    return "Completed ✓";
  }
  const missing = PROJECT_NEED - seat.stats[project];
  return missing > 0 ? `Need ${String(missing)} more` : "Complete";
}

function whyNotCompletable(seat: OwnSeatView, project: ProjectName): IconText | null {
  const rejection = seat.projectRejections[project];
  const isOnlyMissingTheStat = seat.stats[project] < PROJECT_NEED;
  return rejection === null || seat.projects.includes(project) || isOnlyMissingTheStat
    ? null
    : REJECTION_MESSAGES[rejection];
}

export function ProjectsDialog({ seat, onComplete, onClose }: Props) {
  return (
    <Modal title="Projects" size="large" onClose={onClose}>
      <p className={styles["text"]}>
        <TextWithIcons text={PROJECTS_INTRO} />
      </p>
      <ul className={styles["rows"]}>
        {PROJECT_NAMES.map((project) => (
          <li key={project} className={styles["project"]} aria-label={PROJECT_TITLES[project]}>
            <img
              className={styles["projectPicture"]}
              src={projectPictureUrl(project)}
              alt={PROJECT_TITLES[project]}
              loading="lazy"
              decoding="async"
            />
            <div>
              <strong>{PROJECT_TITLES[project]}</strong>
              <span>
                Needs <StatChip stat={project} value={PROJECT_NEED} /> and at least{" "}
                <StatChip stat="income" value={PROJECT_INCOME_NEED} /> · you have{" "}
                <StatChip stat={project} value={seat.stats[project]} /> and{" "}
                <StatChip stat="income" value={seat.stats.income} />
              </span>
              <DialogNote text={whyNotCompletable(seat, project)} />
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
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
