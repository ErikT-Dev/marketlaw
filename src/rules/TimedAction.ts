import type { GameAction } from "./GameAction";

export type TimedAction = {
  readonly action: GameAction;
  readonly at: number;
};
