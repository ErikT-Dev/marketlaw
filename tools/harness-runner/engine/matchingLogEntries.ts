import type { DrawLogEntry } from "../../../src/shared/DrawLogEntry.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

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
  const count = entry.kind === "draw" ? { drew: entry.count } : { shuffled: entry.count };
  return { seat: entry.seat, turn: entry.turn, ...count, ...asked };
}

export function absentLogItems(
  log: ReadonlyArray<DrawLogEntry>,
  expected: unknown,
): ReadonlyArray<unknown> {
  const text = JSON.stringify(log);
  const listed: ReadonlyArray<unknown> = Array.isArray(expected) ? expected : [];
  return listed.filter((item) =>
    typeof item === "string"
      ? !text.includes(JSON.stringify(item))
      : matchingLogEntries(log, [item]).length === 0,
  );
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
