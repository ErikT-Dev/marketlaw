import type { PlayerView } from "./PlayerView";
import type { TutorialProgress } from "./TutorialProgress";

export type TutorialView = {
  readonly progress: TutorialProgress;
  readonly game: PlayerView;
};
