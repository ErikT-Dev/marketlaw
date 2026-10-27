import type { Rejection } from "../shared/Rejection";
import type { Result } from "../shared/Result";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";

export type Transition = {
  readonly before: GameState;
  readonly beforeAsText: string;
  readonly action: GameAction;
  readonly outcome: Result<GameState, Rejection>;
};
