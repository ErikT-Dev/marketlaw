import type { DrawLogEntry } from "../../../src/shared/DrawLogEntry.ts";
import type { MainPhaseLogEntry } from "../../../src/shared/MainPhaseLogEntry.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { GameLogEntry } from "./GameLogEntry.ts";

function turnDrawFieldsOf(entry: DrawLogEntry): Readonly<Record<string, unknown>> {
  if (entry.kind !== "turn_draw") {
    return {};
  }
  const { choice } = entry;
  return choice.option === "A" ? { turn_draw: "A", took: choice.card } : { turn_draw: "B" };
}

function drawFieldsOf(entry: DrawLogEntry): Readonly<Record<string, unknown>> {
  const asked =
    entry.asked === null
      ? {}
      : {
          ...(entry.asked.by === "sector"
            ? { sector: entry.asked.sector }
            : { kind: entry.asked.kind }),
          tier: entry.asked.tier,
        };
  const count = entry.kind === "shuffle" ? { shuffled: entry.count } : { drew: entry.count };
  return { seat: entry.seat, turn: entry.turn, ...count, ...asked, ...turnDrawFieldsOf(entry) };
}

function mainPhaseFieldsOf(entry: MainPhaseLogEntry): Readonly<Record<string, unknown>> {
  const common = { seat: entry.seat, turn: entry.turn };
  switch (entry.kind) {
    case "played":
      return { ...common, played: entry.card };
    case "completed_quest":
      return { ...common, completed_quest: entry.quest };
    case "completed_project":
      return { ...common, completed_project: entry.project };
    case "influence":
      return { ...common, influence: entry.trade };
    case "redrew":
      return { ...common, redrew: entry.times };
    case "income_gained":
      return { ...common, income_gained: entry.income };
    case "support":
      return { ...common, support: entry.funds };
  }
}

function scenarioFieldsOf(entry: GameLogEntry): Readonly<Record<string, unknown>> {
  switch (entry.kind) {
    case "draw":
    case "turn_draw":
    case "shuffle":
      return drawFieldsOf(entry);
    case "played":
    case "completed_quest":
    case "completed_project":
    case "influence":
    case "redrew":
    case "income_gained":
    case "support":
      return mainPhaseFieldsOf(entry);
  }
}

export function matchingLogEntries(
  log: ReadonlyArray<GameLogEntry>,
  expected: unknown,
): ReadonlyArray<unknown> {
  const rows = log.map(scenarioFieldsOf);
  const wanted: ReadonlyArray<unknown> = Array.isArray(expected) ? expected : [];
  return wanted.filter(
    (entry) =>
      isRecord(entry) &&
      rows.some((row) => Object.entries(entry).every(([field, value]) => row[field] === value)),
  );
}
