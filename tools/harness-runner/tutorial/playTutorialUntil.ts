import { TUTORIAL_STEPS } from "../../../src/rules/tutorial/TUTORIAL_STEPS.ts";
import { TUTORIAL_STEP_IDS } from "../../../src/shared/TUTORIAL_STEP_IDS.ts";
import type { TutorialStepId } from "../../../src/shared/TutorialStepId.ts";
import type { TutorialSession } from "./TutorialSession.ts";

export function playTutorialUntil(
  session: TutorialSession,
  player: string,
  step: TutorialStepId,
): void {
  session.start(player);
  for (const passed of TUTORIAL_STEP_IDS.slice(0, TUTORIAL_STEP_IDS.indexOf(step))) {
    session.send(player, TUTORIAL_STEPS[passed].accepts);
    if (session.lastReply?.type !== "tutorial_update") {
      throw new Error(`the tutorial room rejected its own step ${passed}`);
    }
  }
}
