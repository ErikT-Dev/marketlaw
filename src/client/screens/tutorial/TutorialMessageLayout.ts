import type { ScreenRect } from "./ScreenRect";
import type { TutorialMessagePlacement } from "./TutorialMessagePlacement";

export type TutorialMessageLayout = {
  readonly placement: TutorialMessagePlacement | null;
  readonly highlighted: ReadonlyArray<ScreenRect>;
};
