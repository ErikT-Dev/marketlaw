import type { GameAction } from "./GameAction";
import type { GameSetup } from "./GameSetup";
import type { GameState } from "./GameState";

export type SavedGame = {
  readonly schemaVersion: number;
  readonly seed: number;
  readonly setup: GameSetup;
  readonly actionLog: ReadonlyArray<GameAction>;
  readonly state: GameState;
};
