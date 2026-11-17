import type { Rejection } from "../../shared/Rejection";
import type { Result } from "../../shared/Result";
import { TUTORIAL_STEP_IDS } from "../../shared/TUTORIAL_STEP_IDS";
import type { TutorialStage } from "../../shared/TutorialStage";
import type { TutorialStepId } from "../../shared/TutorialStepId";
import { apply } from "../apply";
import { isStepAction } from "./isStepAction";
import type { TutorialAction } from "./TutorialAction";
import type { TutorialState } from "./TutorialState";
import { TUTORIAL_STEPS } from "./TUTORIAL_STEPS";
import { tutorialRandomFor } from "./tutorialRandomFor";

function stageAfter(step: TutorialStepId): TutorialStage {
  return TUTORIAL_STEP_IDS[TUTORIAL_STEP_IDS.indexOf(step) + 1] ?? "complete";
}

export function applyTutorialAction(
  tutorial: TutorialState,
  action: TutorialAction,
  at: number,
): Result<TutorialState, Rejection> {
  const { stage } = tutorial;
  if (stage === "complete" || !isStepAction(action, TUTORIAL_STEPS[stage].accepts)) {
    return { isOk: false, error: { code: "not_this_step" } };
  }
  const next = stageAfter(stage);
  if (action.type === "continue") {
    return { isOk: true, value: { stage: next, game: tutorial.game } };
  }
  const applied = apply(tutorial.game, action, tutorialRandomFor(TUTORIAL_STEPS[stage].draws), at);
  return applied.isOk ? { isOk: true, value: { stage: next, game: applied.value } } : applied;
}
