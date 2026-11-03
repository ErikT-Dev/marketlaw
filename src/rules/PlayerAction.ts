import type { GameAction } from "./GameAction";
import type { SystemAction } from "./SystemAction";

export type PlayerAction = Exclude<GameAction, SystemAction>;
