import type { GameSetup } from "./GameSetup";
import { SAVE_SCHEMA_VERSION } from "./SAVE_SCHEMA_VERSION";
import type { SavedGame } from "./SavedGame";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";

const SETUP_STREAM = 0;

export function startSavedGame(setup: GameSetup, seed: number): SavedGame {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed,
    setup,
    startingState: null,
    actionLog: [],
    state: setUpGame(setup, seededRandom(seed, SETUP_STREAM)),
  };
}
