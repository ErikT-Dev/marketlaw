import type { ReplayRecord } from "./ReplayRecord";

export const REPLAY_MIGRATION_STEPS: ReadonlyArray<(older: ReplayRecord) => ReplayRecord> = [];
