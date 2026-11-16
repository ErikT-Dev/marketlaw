import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import type { DrawLogRow } from "./DrawLogRow";

export type GameLogRow =
  | { readonly kind: "draws"; readonly turn: number; readonly draws: DrawLogRow }
  | { readonly kind: "main_phase"; readonly turn: number; readonly entry: MainPhaseLogEntry };
