import type { CoverageException } from "./CoverageException.ts";
import { isRecord } from "./isRecord.ts";

function toException(entry: unknown): CoverageException | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }
  const { rule, kind, how, approved } = entry;
  if (
    typeof rule !== "string" ||
    typeof how !== "string" ||
    (kind !== "instead" && kind !== "also")
  ) {
    return undefined;
  }
  return { rule, kind, how, approved: typeof approved === "string" ? approved : "" };
}

export function readCoverageExceptions(parsed: unknown): ReadonlyMap<string, CoverageException> {
  const entries = Array.isArray(parsed) ? parsed : [];
  const exceptions = entries
    .map(toException)
    .filter((entry): entry is CoverageException => entry !== undefined);
  return new Map(exceptions.map((exception) => [exception.rule, exception]));
}
