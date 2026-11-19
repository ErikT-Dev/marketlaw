import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
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

const PROJECTS_INTRO: IconText = [
  "Completing a project uses up 8 of its stat and gives ",
  { stat: "income", value: "+1" },
  ", ",
  { stat: "funds", value: "+2" },
  ", ",
  { stat: "influence", value: "+3" },
  " and 1 card. ",
  { stat: "workforce" },
  ", ",
  { stat: "quality" },
  " and ",
  { stat: "satisfaction" },
  " must all be 0 or more.",
];

function firstCompletionText(
  project: ProjectName,
  view: PlayerView,
  names: ReadonlyArray<string>,
): IconText {
  const others = view.seats
    .filter((seat) => seat.kind === "other" && seat.projects.includes(project))
    .map((seat) => playerNameOf(names, seat.seat));
  if (!view.firstCompletions.includes(project)) {
    return [
      "Nobody has completed it yet: whoever completes it first gets ",
      { stat: "funds", value: "+2" },
      " at the end of that turn.",
    ];
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

function whyNotCompletable(seat: OwnSeatView, project: ProjectName): IconText | null {
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
        <TextWithIcons text={PROJECTS_INTRO} />
      </p>
      <ul className={styles["rows"]}>
        {PROJECT_NAMES.map((project) => (
          <li key={project} className={styles["project"]} aria-label={PROJECT_TITLES[project]}>
            <div>
              <strong>{PROJECT_TITLES[project]}</strong>
              <span>
                Needs <StatChip stat={project} value={PROJECT_NEED} /> and at least{" "}
                <StatChip stat="income" value={PROJECT_INCOME_NEED} /> · you have{" "}
                <StatChip stat={project} value={seat.stats[project]} /> and{" "}
                <StatChip stat="income" value={seat.stats.income} />
              </span>
              <DialogNote
                text={
                  seat.projects.includes(project)
                    ? null
                    : firstCompletionText(project, view, playerNames)
                }
              />
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
      {isThirdNext ? (
        <p className={styles["warning"]}>
          {"This would be your 3rd project: it also gives "}
          <StatChip stat="income" value="+1" />
          {" more and 1 more card."}
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
