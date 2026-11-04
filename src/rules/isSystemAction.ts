import type { GameAction } from "./GameAction";
import type { SystemAction } from "./SystemAction";

const SYSTEM_TYPES: ReadonlyArray<GameAction["type"]> = [
  "time_out",
  "pause_game",
  "resume_game",
  "abandon_game",
];

export function isSystemAction(action: GameAction): action is SystemAction {
  return SYSTEM_TYPES.includes(action.type);
}
