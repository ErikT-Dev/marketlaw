import { FIRST_PUBLIC_SAVE_SCHEMA_VERSION } from "../../rules/FIRST_PUBLIC_SAVE_SCHEMA_VERSION";
import { migratedRecord } from "../../shared/migratedRecord";
import { REPLAY_MIGRATION_STEPS } from "./REPLAY_MIGRATION_STEPS";
import type { ReplayRecord } from "./ReplayRecord";

export function migratedReplayRecord(stored: ReplayRecord): ReplayRecord | null {
  return migratedRecord(stored, FIRST_PUBLIC_SAVE_SCHEMA_VERSION, REPLAY_MIGRATION_STEPS);
}
