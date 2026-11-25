import type { SavedGame } from "./SavedGame";

export const SAVE_MIGRATION_STEPS: ReadonlyArray<(older: SavedGame) => SavedGame> = [];
