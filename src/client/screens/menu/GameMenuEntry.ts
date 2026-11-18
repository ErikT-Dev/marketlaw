import type { GameMenuChoice } from "./GameMenuChoice";

export type GameMenuEntry = {
  readonly label: string;
  readonly line: string;
  readonly choice: GameMenuChoice;
};
