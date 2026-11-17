import type { TutorialStepId } from "./TutorialStepId";

export type TutorialProgress =
  | { readonly kind: "step"; readonly step: TutorialStepId; readonly number: number }
  | { readonly kind: "complete" };
