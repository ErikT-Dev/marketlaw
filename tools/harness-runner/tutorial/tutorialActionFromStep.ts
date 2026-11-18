import type { TutorialAction } from "../../../src/rules/tutorial/TutorialAction.ts";
import { actionFromStep } from "../engine/actionFromStep.ts";

const TUTORIAL_SEAT = 1;

export function tutorialActionFromStep(step: Readonly<Record<string, unknown>>): TutorialAction {
  const { player, ...action } = step;
  if (typeof player !== "string") {
    throw new Error(`the tutorial step ${JSON.stringify(step)} names no player`);
  }
  return action["action"] === "continue"
    ? { type: "continue" }
    : actionFromStep({ ...action, seat: TUTORIAL_SEAT });
}
