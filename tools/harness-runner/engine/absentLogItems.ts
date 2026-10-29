import type { DrawLogEntry } from "../../../src/shared/DrawLogEntry.ts";
import { matchingLogEntries } from "./matchingLogEntries.ts";

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
