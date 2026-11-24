import type { ScreenRect } from "./ScreenRect";

export type TutorialPlacementInput = {
  readonly highlighted: ScreenRect;
  readonly highlightedColumn: ScreenRect;
  readonly column: ScreenRect;
  readonly table: ScreenRect;
  readonly bigCard: ScreenRect | null;
  readonly boxHeight: number;
  readonly windowHeight: number;
};
