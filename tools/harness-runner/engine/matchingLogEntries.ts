import type { DrawLogEntry } from "../../../src/shared/DrawLogEntry.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

function turnDrawFieldsOf(entry: DrawLogEntry): Readonly<Record<string, unknown>> {
  if (entry.kind !== "turn_draw") {
    return {};
  }
  const { choice } = entry;
  return choice.option === "A" ? { turn_draw: "A", took: choice.card } : { turn_draw: "B" };
}

function scenarioFieldsOf(entry: DrawLogEntry): Readonly<Record<string, unknown>> {
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

export function matchingLogEntries(
  log: ReadonlyArray<DrawLogEntry>,
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
