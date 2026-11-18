import type { GameAction } from "../GameAction";

export type TutorialAction = GameAction | { readonly type: "continue" };
