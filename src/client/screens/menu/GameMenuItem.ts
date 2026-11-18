import type { GameMenuEntry } from "./GameMenuEntry";

export type GameMenuItem = {
  readonly entry: GameMenuEntry;
  readonly isAvailable: boolean;
};
