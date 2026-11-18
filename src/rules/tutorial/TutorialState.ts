import type { TutorialStage } from "../../shared/TutorialStage";
import type { GameState } from "../GameState";

export type TutorialState = {
  readonly stage: TutorialStage;
  readonly game: GameState;
};
