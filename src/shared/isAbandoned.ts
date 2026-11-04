import type { GameEnding } from "./GameEnding";

export function isAbandoned(ending: GameEnding): boolean {
  return ending === "everyone_left" || ending === "paused_too_long";
}
