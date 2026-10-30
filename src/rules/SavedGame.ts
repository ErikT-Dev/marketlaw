import type { GameSetup } from "./GameSetup";
import type { GameState } from "./GameState";
import type { TimedAction } from "./TimedAction";

export type SavedGame = {
  readonly schemaVersion: number;
  readonly seed: number;
  readonly setup: GameSetup;
  readonly startingState: GameState | null;
  readonly actionLog: ReadonlyArray<TimedAction>;
  readonly state: GameState;
};
