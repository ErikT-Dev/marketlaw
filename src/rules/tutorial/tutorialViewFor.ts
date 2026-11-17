import { TUTORIAL_STEP_IDS } from "../../shared/TUTORIAL_STEP_IDS";
import type { TutorialProgress } from "../../shared/TutorialProgress";
import type { TutorialStage } from "../../shared/TutorialStage";
import type { TutorialView } from "../../shared/TutorialView";
import { viewFor } from "../viewFor";
import type { TutorialState } from "./TutorialState";

const TUTORIAL_SEAT = 1;

function progressOf(stage: TutorialStage): TutorialProgress {
  return stage === "complete"
    ? { kind: "complete" }
    : { kind: "step", step: stage, number: TUTORIAL_STEP_IDS.indexOf(stage) + 1 };
}

export function tutorialViewFor(tutorial: TutorialState): TutorialView {
  return { progress: progressOf(tutorial.stage), game: viewFor(tutorial.game, TUTORIAL_SEAT) };
}
