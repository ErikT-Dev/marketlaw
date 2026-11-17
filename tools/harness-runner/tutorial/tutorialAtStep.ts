import { applyTutorialAction } from "../../../src/rules/tutorial/applyTutorialAction.ts";
import { startTutorial } from "../../../src/rules/tutorial/startTutorial.ts";
import type { TutorialState } from "../../../src/rules/tutorial/TutorialState.ts";
import { TUTORIAL_STEPS } from "../../../src/rules/tutorial/TUTORIAL_STEPS.ts";
import { TUTORIAL_STEP_IDS } from "../../../src/shared/TUTORIAL_STEP_IDS.ts";
import type { TutorialStepId } from "../../../src/shared/TutorialStepId.ts";

export function tutorialAtStep(step: TutorialStepId, now: number): TutorialState {
  return TUTORIAL_STEP_IDS.slice(0, TUTORIAL_STEP_IDS.indexOf(step)).reduce((tutorial, passed) => {
    const result = applyTutorialAction(tutorial, TUTORIAL_STEPS[passed].accepts, now);
    if (!result.isOk) {
      throw new Error(`the tutorial rejected its own step ${passed}: ${result.error.code}`);
    }
    return result.value;
  }, startTutorial(now));
}
