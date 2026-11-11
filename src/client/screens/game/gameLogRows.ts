import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import { drawLogRows } from "./drawLogRows";
import type { GameLogRow } from "./GameLogRow";

function isLaterInTurn(row: GameLogRow, other: GameLogRow): boolean {
  return row.kind === "main_phase" && other.kind === "draws";
}

export function gameLogRows(
  drawLog: ReadonlyArray<DrawLogEntry>,
  mainPhaseLog: ReadonlyArray<MainPhaseLogEntry>,
): ReadonlyArray<GameLogRow> {
  const rows: ReadonlyArray<GameLogRow> = [
    ...drawLogRows(drawLog).map((draws): GameLogRow => ({
      kind: "draws",
      turn: draws[0].turn,
      draws,
    })),
    ...mainPhaseLog.map((entry): GameLogRow => ({ kind: "main_phase", turn: entry.turn, entry })),
  ];
  return [...rows].sort((row, other) =>
    row.turn !== other.turn
      ? row.turn - other.turn
      : Number(isLaterInTurn(row, other)) - Number(isLaterInTurn(other, row)),
  );
}
