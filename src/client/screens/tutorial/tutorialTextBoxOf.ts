import { TUTORIAL_STEP_IDS } from "../../../shared/TUTORIAL_STEP_IDS";
import type { TutorialStepId } from "../../../shared/TutorialStepId";
import { TUTORIAL_TEXTS } from "./TUTORIAL_TEXTS";
import type { TutorialTextBoxContent } from "./TutorialTextBoxContent";

const BUTTON_STEPS: Readonly<Partial<Record<TutorialStepId, "continue" | "finish">>> = {
  "T1.1": "continue",
  "T2.1": "continue",
  "T5.4": "finish",
};

function sentenceOf(waitingFor: string): string {
  return `${waitingFor.charAt(0).toUpperCase()}${waitingFor.slice(1)}.`;
}

function withoutEnding(text: string, ending: string): string {
  return text.endsWith(` ${ending}`) ? text.slice(0, -ending.length - 1) : text;
}

function textBeforeOf(step: TutorialStepId): string | null {
  const index = TUTORIAL_STEP_IDS.indexOf(step);
  const before = index > 0 ? TUTORIAL_STEP_IDS[index - 1] : undefined;
  return before === undefined ? null : TUTORIAL_TEXTS[before].textAfter;
}

export function tutorialTextBoxOf(step: TutorialStepId, number: number): TutorialTextBoxContent {
  const { text, waitingFor } = TUTORIAL_TEXTS[step];
  const button = BUTTON_STEPS[step] ?? null;
  const actionLine = button === null ? sentenceOf(waitingFor) : null;
  const ownText = text === null || actionLine === null ? text : withoutEnding(text, actionLine);
  return {
    stepLine: `Step ${String(number)} of ${String(TUTORIAL_STEP_IDS.length)}`,
    paragraphs: [textBeforeOf(step), ownText].filter((paragraph) => paragraph !== null),
    actionLine,
    button,
  };
}
