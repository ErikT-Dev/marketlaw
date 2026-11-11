import type { DrawLogEntry } from "../../../src/shared/DrawLogEntry.ts";
import type { MainPhaseLogEntry } from "../../../src/shared/MainPhaseLogEntry.ts";

export type GameLogEntry = DrawLogEntry | MainPhaseLogEntry;
