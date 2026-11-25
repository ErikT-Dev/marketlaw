import { migratedRecord } from "../shared/migratedRecord";
import { FIRST_PUBLIC_SAVE_SCHEMA_VERSION } from "./FIRST_PUBLIC_SAVE_SCHEMA_VERSION";
import { SAVE_MIGRATION_STEPS } from "./SAVE_MIGRATION_STEPS";
import type { SavedGame } from "./SavedGame";

export function migratedSavedGame(saved: SavedGame): SavedGame | null {
  return migratedRecord(saved, FIRST_PUBLIC_SAVE_SCHEMA_VERSION, SAVE_MIGRATION_STEPS);
}
