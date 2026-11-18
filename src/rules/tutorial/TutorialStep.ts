import type { CardName } from "../../shared/catalogue/CardName";
import type { TutorialAction } from "./TutorialAction";

export type TutorialStep = {
  readonly accepts: TutorialAction;
  readonly draws: ReadonlyArray<CardName>;
};
