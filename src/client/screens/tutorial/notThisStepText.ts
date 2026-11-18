import type { TutorialStepId } from "../../../shared/TutorialStepId";
import { TUTORIAL_TEXTS } from "./TUTORIAL_TEXTS";

export function notThisStepText(step: TutorialStepId): string {
  return `The tutorial is waiting for you to ${TUTORIAL_TEXTS[step].waitingFor}. Nothing changed.`;
}
