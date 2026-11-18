import type { ScreenPart } from "../game/ScreenPart";

export type TutorialFocus = {
  readonly highlighted: ReadonlyArray<ScreenPart>;
  readonly usableColumn: "none" | "middle" | "right";
};
