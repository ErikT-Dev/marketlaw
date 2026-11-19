import type { PlayerView } from "../../shared/PlayerView";
import { TUTORIAL_STEP_IDS } from "../../shared/TUTORIAL_STEP_IDS";
import type { TutorialProgress } from "../../shared/TutorialProgress";
import type { TutorialStage } from "../../shared/TutorialStage";
import type { TutorialView } from "../../shared/TutorialView";
import type { GameState } from "../GameState";
import { viewFor } from "../viewFor";
import type { TutorialState } from "./TutorialState";

const TUTORIAL_SEAT = 1;

function progressOf(stage: TutorialStage): TutorialProgress {
  return stage === "complete"
    ? { kind: "complete" }
    : { kind: "step", step: stage, number: TUTORIAL_STEP_IDS.indexOf(stage) + 1 };
}

function withoutRedraw(game: GameState): PlayerView {
  const view = viewFor(game, TUTORIAL_SEAT);
  return {
    ...view,
    seats: view.seats.map((seat) =>
      seat.kind === "own" ? { ...seat, redrawRejection: "not_this_step" } : seat,
    ),
  };
}

export function tutorialViewFor(tutorial: TutorialState): TutorialView {
  return { progress: progressOf(tutorial.stage), game: withoutRedraw(tutorial.game) };
}
