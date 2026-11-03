import type { GameSetup } from "../../rules/GameSetup";
import type { GameState } from "../../rules/GameState";
import type { TimedAction } from "../../rules/TimedAction";

export type ReplayRecord = {
  readonly schemaVersion: number;
  readonly seed: number;
  readonly setup: GameSetup;
  readonly startingState: GameState | null;
  readonly actionLog: ReadonlyArray<TimedAction>;
};
