import type { DrawLogEntry } from "../../../shared/DrawLogEntry";

export type DrawLogRow = readonly [DrawLogEntry, ...DrawLogEntry[]];
